import { AavegotchiLand, DirectRental, Nft } from "../../generated/schema";
import { log, BigInt } from "@graphprotocol/graph-ts";
import { ActionRight } from "./types";


export function endPreviousRental(nft: Nft, txHash: string, timestamp: BigInt): void {
    const previousRentalId = nft.currentDirectRental;
    if (!previousRentalId) {
      log.debug("[endPreviousRental] nft {} has no previous rental, tx: {}", [nft.id, txHash]);
      return;
    }
  
    const previousRental = DirectRental.load(previousRentalId!);
    if (!previousRental) {
      log.debug("[endPreviousRental] previous rental {} for nft {} not found, tx: {}", [previousRentalId!, nft.id, txHash]);
      return;
    }
  
    previousRental.endedAt = timestamp;
    previousRental.endedTxHash = txHash;
    previousRental.save();
  
    nft.currentDirectRental = null;
    nft.save();
  }

export function createDirectRental(nft: Nft, land: AavegotchiLand, txHash: string, timestamp: BigInt, logIndex: BigInt): DirectRental {
    const directRental = new DirectRental(`${txHash}-${logIndex}`);
    directRental.nft = nft.id;
    directRental.lender = nft.currentOwner;
    directRental.taker = `${land.channelingWhitelist},${land.emptyReservoirWhitelist}`;
    directRental.lender = nft.currentOwner;
    directRental.startedAt = timestamp;
    directRental.startedTxHash = txHash;
    directRental.save();
  
    nft.currentDirectRental = directRental.id;
    nft.save();

    return directRental;
  }


  export function updateLandRights(land: AavegotchiLand, actionRight: BigInt, accessRight: BigInt, whitelistId: BigInt): AavegotchiLand {
    // We skip the other action rights, so it MUST be Channeling or Empty Reservoir here
  if (actionRight.equals(BigInt.fromI32(ActionRight.CHANNELING))) {
    land.channelingAccessRight = accessRight;
    land.channelingWhitelist = whitelistId;
  } else {
    land.emptyReservoirAccessRight = accessRight;
    land.emptyReservoirWhitelist = whitelistId;
  }
  land.save();
  
  return land
  }