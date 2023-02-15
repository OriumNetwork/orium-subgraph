import { ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { GotchiLendingAdded } from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  buildEventParamAddress,
  buildEventParamAddressArray,
  buildEventParamUint,
  buildEventParamUintArray,
} from "../fixture";

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
