import { ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  GotchiLendingAdded,
  GotchiLendingCanceled,
  GotchiLendingExecute,
  GotchiLendingExecuted,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { RentalOffer } from "../../generated/schema";
import {
  buildEventParamAddress,
  buildEventParamAddressArray,
  buildEventParamUint,
  buildEventParamUintArray,
} from "../fixture";
import { BigInt } from "@graphprotocol/graph-ts";
import { GHST_TOKEN_ADDRESS } from "../../src/utils/addresses";

export function createGotchiLendingAddedEvent(
  tokenId: string,
  lender: string,
  thirdParty: string,
  initialCost: string,
  duration: string,
  revenueSplit: string[],
  revenueTokens: string[],
  timeCreated: string
): GotchiLendingAdded {
  const event = changetype<GotchiLendingAdded>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();
  event.parameters.push(buildEventParamUint("listingId", tokenId));
  event.parameters.push(buildEventParamAddress("lender", lender));
  event.parameters.push(buildEventParamUint("tokenId", tokenId));
  event.parameters.push(buildEventParamUint("initialCost", initialCost));
  event.parameters.push(buildEventParamUint("period", duration));
  event.parameters.push(buildEventParamUintArray("revenueSplit", revenueSplit));
  event.parameters.push(buildEventParamAddress("originalOwner", lender));
  event.parameters.push(buildEventParamAddress("thirdParty", thirdParty));
  event.parameters.push(buildEventParamUint("whitelistId", "1"));
  event.parameters.push(
    buildEventParamAddressArray("revenueTokens", revenueTokens)
  );
  event.parameters.push(buildEventParamUint("timeCreated", timeCreated));

  return event;
}

export function createGotchiLendingCancelledEvent(
  tokenId: string,
  lender: string,
  thirdParty: string,
  initialCost: string,
  duration: string,
  revenueSplit: string[],
  whitelistId: string,
  revenueTokens: string[],
  timeCreated: string
): GotchiLendingCanceled {
  const event = changetype<GotchiLendingCanceled>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();
  event.parameters.push(buildEventParamUint("listingId", tokenId));
  event.parameters.push(buildEventParamAddress("lender", lender));
  event.parameters.push(buildEventParamUint("tokenId", tokenId));
  event.parameters.push(buildEventParamUint("initialCost", initialCost));
  event.parameters.push(buildEventParamUint("period", duration));
  event.parameters.push(buildEventParamUintArray("revenueSplit", revenueSplit));
  event.parameters.push(buildEventParamAddress("originalOwner", lender));
  event.parameters.push(buildEventParamAddress("thirdParty", thirdParty));
  event.parameters.push(buildEventParamUint("whitelistId", whitelistId));
  event.parameters.push(
    buildEventParamAddressArray("revenueTokens", revenueTokens)
  );
  event.parameters.push(buildEventParamUint("timeCreated", timeCreated));

  return event;
}

export function createMockRentalOffer(
  tokenId: string,
  lender: string,
  initialCost: string,
  duration: string,
  revenueSplit: string[],
  revenueTokens: string[],
  timeCreated: string,
  creationTxHash: string = "0x0000000"
): RentalOffer {
  const rentalOffer = new RentalOffer(tokenId);
  rentalOffer.nft = tokenId;
  rentalOffer.lender = lender;
  rentalOffer.feeToken = GHST_TOKEN_ADDRESS;
  rentalOffer.feeAmount = BigInt.fromString(initialCost);
  rentalOffer.duration = BigInt.fromString(duration);
  rentalOffer.profitShareSplit = revenueSplit.map<BigInt>((split) =>
    BigInt.fromString(split)
  );
  rentalOffer.profitShareTokens = revenueTokens;
  rentalOffer.createdAt = BigInt.fromString(timeCreated);
  rentalOffer.creationTxHash = creationTxHash;
  rentalOffer.save();

  return rentalOffer;
}

export function createGotchiLendingExecutedEvent(
  tokenId: string,
  listingId: string,
  lender: string,
  borrower: string,
  thirdParty: string,
  initialCost: string,
  duration: string,
  revenueSplit: string[],
  revenueTokens: string[],
  whitelistId: string,
  timeCreated: string
): GotchiLendingExecuted {
  const event = changetype<GotchiLendingExecuted>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();
  event.parameters.push(buildEventParamUint("listingId", listingId));
  event.parameters.push(buildEventParamAddress("lender", lender));
  event.parameters.push(buildEventParamAddress("borrower", borrower));
  event.parameters.push(buildEventParamUint("tokenId", tokenId));
  event.parameters.push(buildEventParamUint("initialCost", initialCost));
  event.parameters.push(buildEventParamUint("period", duration));
  event.parameters.push(buildEventParamUintArray("revenueSplit", revenueSplit));
  event.parameters.push(buildEventParamAddress("originalOwner", lender));
  event.parameters.push(buildEventParamAddress("thirdParty", thirdParty));
  event.parameters.push(buildEventParamUint("whitelistId", whitelistId));
  event.parameters.push(
    buildEventParamAddressArray("revenueTokens", revenueTokens)
  );
  event.parameters.push(buildEventParamUint("timeAgreed", timeCreated));

  return event;
}
