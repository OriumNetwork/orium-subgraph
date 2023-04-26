import { log } from "matchstick-as";
import { ChannelAlchemica } from "../../../generated/Realm/RealmDiamond";
import { generateNftId } from "../../utils/misc";
import { AAVEGOTCHI, AAVEGOTCHI_LAND, ALCHEMICA_TYPE_TO_ADDRESS } from "../../utils/constants";
import { Nft, RentalEarning } from "../../../generated/schema";

/**
 * event ChannelAlchemica(
 *     uint256 indexed _realmId,
 *     uint256 indexed  _gotchiId,
 *     uint256[4] _alchemica,
 *     uint256 _spilloverRate,   
 *     uint256 _spilloverRadius
 * );
 */
export function handleChannelAlchemica(event: ChannelAlchemica): void {
    const realmId = generateNftId(AAVEGOTCHI_LAND, event.params._realmId);
    handleAlchemicaForNft(event, realmId);

    const gotchiId = generateNftId(AAVEGOTCHI, event.params._gotchiId);
    handleAlchemicaForNft(event, gotchiId);
}

function handleAlchemicaForNft(event: ChannelAlchemica, nftId: string): void{
    const nft = Nft.load(nftId);

    if (!nft) {
        log.debug("[handleChannelAlchemica] Nft {} not found, tx: {}", [nftId, event.transaction.hash.toHexString()]);
        return;
    }

    const rentalId = nft.currentRental;

    if(!rentalId){
        log.debug("[handleChannelAlchemica] Nft {} has no rental, tx: {}", [nftId, event.transaction.hash.toHexString()]);
        return;
    }

    for(let i = 0; i < event.params._alchemica.length; i++) {
    const rentalEarning = new RentalEarning(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}-${i}`);
    rentalEarning.tokenAddress = ALCHEMICA_TYPE_TO_ADDRESS[i];
    rentalEarning.amount = event.params._alchemica[i];
    rentalEarning.nft = nftId;
    rentalEarning.rental = rentalId!;
    rentalEarning.txHash = event.transaction.hash.toHex();
    rentalEarning.timestamp = event.block.timestamp;
    rentalEarning.save();

    log.warning("[handleChannelAlchemica] tokenAddress {}, amount {}, nftId {}, rentalId {}, txHash {}, timestamp {}", [
        rentalEarning.tokenAddress,
        rentalEarning.amount.toString(),
        rentalEarning.nft,
        rentalEarning.rental,
        rentalEarning.txHash,
        rentalEarning.timestamp.toString()
    ]);
}
}



