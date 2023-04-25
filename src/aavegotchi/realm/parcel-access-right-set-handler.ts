import { log } from "@graphprotocol/graph-ts";
import { ParcelAccessRightSet } from "../../../generated/Realm/RealmDiamond";
import { Nft } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";

const TYPE = "AAVEGOTCHI_LAND";

/**
 *  event ParcelAccessRightSet(
 *        uint256 _realmId, 
 *        uint256 _actionRight, 
 *        uint256 _accessRight
 *  );
 */
export function handleParcelAccessRightSet(event: ParcelAccessRightSet): void {
  const nftId = generateNftId(TYPE, event.params._realmId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug("NFT {} not found, tx: {}", [nftId, event.transaction.hash.toHex()]);
    return;
  }
  // TODO: create Rental or RentalOffer

}
