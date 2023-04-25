import { log } from "@graphprotocol/graph-ts";
import { ParcelWhitelistSet } from "../../../generated/Realm/RealmDiamond";
import { Nft, Rental } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";

const TYPE = "AAVEGOTCHI_LAND";

/**
  * event ParcelWhitelistSet(
  *      uint256 _realmId, 
  *      uint256 _actionRight, 
  *      uint256 _whitelistId
  *      );
 */
export function handleParcelWhitelistSet(event: ParcelWhitelistSet): void {
  const nftId = generateNftId(TYPE, event.params._realmId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug("NFT {} not found, tx: {}", [nftId, event.transaction.hash.toHex()]);
    return;
  }

  const rental = new Rental(`${event.transaction.hash.toHex()}-${event.logIndex.toString()}`);
  rental.nft = nft.id;
  rental.borrower = event.params._whitelistId.toHexString(); // TODO: change this later
  rental.lender = nft.currentOwner;
  rental.startedAt = event.block.timestamp;
  rental.startedTxHash = event.transaction.hash.toHex();
}
