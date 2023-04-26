import { log } from "@graphprotocol/graph-ts";
import { TransferTokensToGotchi } from "../../../generated/Realm/RealmDiamond";
import { Nft, RentalEarning } from "../../../generated/schema";
import { AAVEGOTCHI } from "../../utils/constants";
import { generateNftId } from "../../utils/misc";
/**
 * event TransferTokensToGotchi(
 *       address indexed _sender,
 *       uint256 indexed _gotchiId,
 *       address _tokenAddresses,
 *       uint256 _amount
 *   );
 */
export function handleTransferTokensToGotchi(event: TransferTokensToGotchi): void {
    const gotchiId = generateNftId(AAVEGOTCHI, event.params._gotchiId);
    const gotchi = Nft.load(gotchiId);

    if (!gotchi) {
        log.debug("[handleTransferTokensToGotchi] Nft {} not found, tx: {}", [gotchiId, event.transaction.hash.toHexString()]);
        return;
    }

    const rentalId = gotchi.currentRental;

    if(!rentalId){
        log.debug("[handleTransferTokensToGotchi] Nft {} has no rental, tx: {}", [gotchiId, event.transaction.hash.toHexString()]);
        return;
    }

    const rentalEarning = new RentalEarning(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    rentalEarning.tokenAddress = event.params._tokenAddresses.toHexString();
    rentalEarning.amount = event.params._amount;
    rentalEarning.nft = gotchiId;
    rentalEarning.rental = rentalId!;
    rentalEarning.txHash = event.transaction.hash.toHex();
    rentalEarning.timestamp = event.block.timestamp;
    rentalEarning.save();

    log.warning("[handleTransferTokensToGotchi] tokenAddress {}, amount {}, nftId {}, rentalId {}, txHash {}, timestamp {}", [
        rentalEarning.tokenAddress,
        rentalEarning.amount.toString(),
        rentalEarning.nft,
        rentalEarning.rental,
        rentalEarning.txHash,
        rentalEarning.timestamp.toString()
    ]);
}
