import { log } from "matchstick-as";
import { AlchemicaClaimed } from "../../../generated/Realm/RealmDiamond";
import { generateNftId } from "../../utils/misc";
import { AAVEGOTCHI, AAVEGOTCHI_LAND, ALCHEMICA_CLAIMED_EVENT, ALCHEMICA_TYPE_TO_ADDRESS } from "../../utils/constants";
import { Nft, RentalEarning } from "../../../generated/schema";

/**
 * event AlchemicaClaimed(
 *     uint256 indexed _nftId,
 *     uint256 indexed _gotchiId,
 *     uint256 indexed _alchemicaType,
 *     uint256 _amount,
 *     uint256 _spilloverRate,
 *     uint256 _spilloverRadius
 * );
 */
export function handleAlchemicaClaimed(event: AlchemicaClaimed): void {
    const realmId = generateNftId(AAVEGOTCHI_LAND, event.params._realmId);
    handleAlchemicaForNft(event, realmId, true);

    const gotchiId = generateNftId(AAVEGOTCHI, event.params._gotchiId);
    handleAlchemicaForNft(event, gotchiId, false);
}

function handleAlchemicaForNft(event: AlchemicaClaimed, nftId: string, isDirectRental: boolean): void {
    const nft = Nft.load(nftId);

    if (!nft) {
        log.debug("[handleAlchemicaClaimed] Nft {} not found, tx: {}", [nftId, event.transaction.hash.toHexString()]);
        return;
    }

    const rentalId = isDirectRental ? nft.currentDirectRental : nft.currentRental;

    if (!rentalId) {
        log.debug("[handleAlchemicaClaimed] Nft {} has no rental, tx: {}", [nftId, event.transaction.hash.toHexString()]);
        return;
    }

    const rentalEarning = new RentalEarning(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    rentalEarning.tokenAddress = ALCHEMICA_TYPE_TO_ADDRESS[event.params._alchemicaType.toI32()];
    rentalEarning.amount = event.params._amount;
    rentalEarning.nft = nftId;
    rentalEarning.txHash = event.transaction.hash.toHex();
    rentalEarning.timestamp = event.block.timestamp;
    rentalEarning.eventName = ALCHEMICA_CLAIMED_EVENT;

    if (isDirectRental) {
        rentalEarning.directRental = rentalId!;
    } else {
        rentalEarning.rental = rentalId!;
    }

    rentalEarning.save();

    log.warning("[handleAlchemicaClaimed] tokenAddress {}, amount {}, nftId {}, rentalId {}, txHash {}, timestamp {}, eventName {}", [
        rentalEarning.tokenAddress,
        rentalEarning.amount.toString(),
        rentalEarning.nft,
        rentalId!,
        rentalEarning.txHash,
        rentalEarning.timestamp.toString(),
        rentalEarning.eventName
    ]);
}


