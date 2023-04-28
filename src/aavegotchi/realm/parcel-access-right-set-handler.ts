import { log, BigInt } from "@graphprotocol/graph-ts";
import { ParcelAccessRightSet } from "../../../generated/Realm/RealmDiamond";
import { DirectRental, Nft } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";

const TYPE = "AAVEGOTCHI_LAND";

/**
 *  event ParcelAccessRightSet(
 *        uint256 _realmId, 
 *        uint256 _actionRight, 
 *        uint256 _accessRight
 *  );
 * 
 *  Action Rights:
 *     0: Channeling - only owner
 *     1: Empty Reservoir - only owner
 *     2: Equip Installations
 *     3: Equip Tiles
 *     4: Unequip Installations
 *     5: Unequip Tiles
 *     6: Upgrade Installations
 *
 *  Access Rights:
 *     0: Only Owner
 *     1: Owner + Lent Out
 *     2: Whitelisted Only
 *     3: Allow blacklisted
 *     4: Anyone
 */
export function handleParcelAccessRightSet(event: ParcelAccessRightSet): void {

  if (event.params._actionRight.notEqual(BigInt.zero())) {
    // To end a rental, the action right must be Channeling
    log.debug("Action right {} is not Channeling, tx: {}", [event.params._actionRight.toString(), event.transaction.hash.toHex()]);
    return;
  }

  if(event.params._accessRight.notEqual(BigInt.zero())){
    // To end a rental, the access right must be Only Owner
    log.debug("Access right {} is not Only Owner, tx: {}", [event.params._accessRight.toString(), event.transaction.hash.toHex()]);
    return;
  }

  const nftId = generateNftId(TYPE, event.params._realmId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug("NFT {} not found, tx: {}", [nftId, event.transaction.hash.toHex()]);
    return;
  }

  const rentalId = nft.currentDirectRental;

  if (!rentalId) {
    log.debug("NFT {} has no rental, tx: {}", [nftId, event.transaction.hash.toHex()]);
    return;
  }

  const rental = DirectRental.load(rentalId!);

  if (!rental) {
    log.debug("Rental {} not found, tx: {}", [rentalId!, event.transaction.hash.toHex()]);
    return;
  }

  rental.endedAt = event.block.timestamp;
  rental.endedTxHash = event.transaction.hash.toHex();
  rental.save();
}
