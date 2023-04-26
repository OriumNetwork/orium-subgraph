import { log } from "matchstick-as";
import { AlchemicaClaimed } from "../../../generated/Realm/RealmDiamond";
import { generateNftId } from "../../utils/misc";
import { AAVEGOTCHI, AAVEGOTCHI_LAND, ALCHEMICA_TYPE_TO_ADDRESS } from "../../utils/constants";
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
    handleAlchemicaForNft(event, realmId);

    const gotchiId = generateNftId(AAVEGOTCHI, event.params._gotchiId);
    handleAlchemicaForNft(event, gotchiId);
}

function handleAlchemicaForNft(event: AlchemicaClaimed, nftId: string): void{
    const nft = Nft.load(nftId);

    if (!nft) {
        log.debug("[handleAlchemicaClaimed] Nft {} not found, tx: {}", [nftId, event.transaction.hash.toHexString()]);
        return;
    }

    const rentalId = nft.currentRental;

    if(!rentalId){
        log.debug("[handleAlchemicaClaimed] Nft {} has no rental, tx: {}", [nftId, event.transaction.hash.toHexString()]);
        return;
    }

    const rentalEarning = new RentalEarning(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    rentalEarning.tokenAddress = ALCHEMICA_TYPE_TO_ADDRESS[event.params._alchemicaType.toI32()];
    rentalEarning.amount = event.params._amount;
    rentalEarning.nft = nftId;
    rentalEarning.rental = rentalId!;
    rentalEarning.txHash = event.transaction.hash.toHex();
    rentalEarning.timestamp = event.block.timestamp;
    rentalEarning.save();

    log.warning("[handleAlchemicaClaimed] tokenAddress {}, amount {}, nftId {}, rentalId {}, txHash {}, timestamp {}", [
        rentalEarning.tokenAddress,
        rentalEarning.amount.toString(),
        rentalEarning.nft,
        rentalEarning.rental,
        rentalEarning.txHash,
        rentalEarning.timestamp.toString()
    ]);
}


