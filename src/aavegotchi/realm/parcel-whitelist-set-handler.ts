import { BigInt, log } from "@graphprotocol/graph-ts";
import { ParcelWhitelistSet } from "../../../generated/Realm/RealmDiamond";
import { DirectRental, Nft } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";

const TYPE = "AAVEGOTCHI_LAND";

/**
  * event ParcelWhitelistSet(
  *      uint256 _realmId, 
  *      uint256 _actionRight, 
  *      uint256 _whitelistId
  *      );
  * 
  *  Action Rights:
  *     0: Channeling
  *     1: Empty Reservoir
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
export function handleParcelWhitelistSet(event: ParcelWhitelistSet): void {
  const nftId = generateNftId(TYPE, event.params._realmId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug("[handleParcelWhitelistSet] NFT {} not found, tx: {}", [nftId, event.transaction.hash.toHex()]);
    return;
  }

  const directRental = new DirectRental(`${event.transaction.hash.toHex()}-${event.logIndex.toString()}`);
  directRental.nft = nft.id;
  directRental.lender = nft.currentOwner;
  directRental.taker = event.params._whitelistId.toHexString();
  directRental.lender = nft.currentOwner;
  directRental.startedAt = event.block.timestamp;
  directRental.startedTxHash = event.transaction.hash.toHex();
  directRental.save();

  if(nft.currentDirectRental){
    endPreviousRental(nft.currentDirectRental!, event.transaction.hash.toHex(), event.block.timestamp);
  }

  nft.currentDirectRental = directRental.id;
  nft.save();

  log.warning("[handleParcelWhitelistSet] nftId {}, directRentalId {}, lender {}, taker {}, startedAt {}, startedTxHash {}", [
    directRental.nft,
    directRental.id,
    directRental.lender,
    directRental.taker!,
    directRental.startedAt.toString(),
    directRental.startedTxHash,
  ]);
}

function endPreviousRental(previousRentalId: string, txHash: string, timestamp: BigInt): void {
    const previousRental = DirectRental.load(previousRentalId);

    if (!previousRental) {
      log.debug("[handleParcelWhitelistSet] previous rental {} not found, tx: {}", [previousRentalId, txHash]);
      return;
    }

    previousRental.endedAt = timestamp;
    previousRental.endedTxHash = txHash;
    previousRental.save();
}
