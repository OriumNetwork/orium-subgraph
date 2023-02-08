import {assert, describe, newMockEvent, test, afterAll, beforeAll, clearStore} from "matchstick-as";
import { GotchiLendingAdded } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ZERO_ADDRESS, ONE_ETHER } from "../../../src/utils/constants";
import { handlerCreateAavegotchiRentalOffer } from "../../../src/aavegotchi";
import { GHST_TOKEN_ADDRESS } from "../../../src/utils/addresses";
import {
  arrayToString, buildEventParamAddressArray, buildEventParamUint, buildEventParamUintArray, buildEventParamAddress,
  createMockGotchi,
} from "../../fixture";

const tokenId = "123";
const unixTimestamp = "1675888946";
const lender = "0x403e967b044d4be25170310157cb1a4bf10bdd0f";
const duration = "10";
const initialCost = "1000";
const revenueTokens = [
  "0x403e967b044d4be25170310157cb1a4bf10bdd0f", "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8",
  "0x6a3e7c3c6ef65ee26975b12293ca1aad7e1daed2", "0x42e5e06ef5b90fe15f853f59299fc96259209c5c",
];

describe("Aavegotchi Rentals", () => {

  beforeAll(() => {
    createMockGotchi(tokenId);
  });

  afterAll(() => {
    clearStore();
  });

  test("Testing Create Rental Offer without Third-Party", () => {
    const revenueSplit = ["60", "40"];
    const event = changetype<GotchiLendingAdded>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(buildEventParamUint("listingId", tokenId));
    event.parameters.push(buildEventParamAddress("lender", lender));
    event.parameters.push(buildEventParamUint("tokenId", tokenId));
    event.parameters.push(buildEventParamUint("initialCost", initialCost));
    event.parameters.push(buildEventParamUint("period", duration));
    event.parameters.push(buildEventParamUintArray("revenueSplit", revenueSplit));
    event.parameters.push(buildEventParamAddress("originalOwner", lender));
    event.parameters.push(buildEventParamAddress("thirdParty", ZERO_ADDRESS));
    event.parameters.push(buildEventParamUint("whitelistId", "0"));
    event.parameters.push(buildEventParamAddressArray("revenueTokens", revenueTokens));
    event.parameters.push(buildEventParamUint("timeCreated", unixTimestamp));

    handlerCreateAavegotchiRentalOffer(event);

    const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
    assert.fieldEquals("Nft", "AAVEGOTCHI-" + tokenId, "currentRentalOffer", id);
    assert.fieldEquals("RentalOffer", id, "nft", "AAVEGOTCHI-" + tokenId);
    assert.fieldEquals("RentalOffer", id, "lender", lender);
    assert.fieldEquals("RentalOffer", id, "createdAt", unixTimestamp);
    assert.fieldEquals("RentalOffer", id, "duration", duration);
    assert.fieldEquals("RentalOffer", id, "priceAmount", initialCost);
    assert.fieldEquals("RentalOffer", id, "priceAddress", GHST_TOKEN_ADDRESS);

    const profitShareSplitEther = revenueSplit.map<string>(token => BigInt.fromString(token).times(ONE_ETHER).toString());
    assert.fieldEquals("RentalOffer", id, "profitShareSplit", arrayToString(profitShareSplitEther));
    assert.fieldEquals("RentalOffer", id, "profitShareTokens", arrayToString(revenueTokens));
  });

  test("Testing Create Rental Offer with Third-Party", () => {
    const revenueSplit = ["60", "30", "10"];
    const event = changetype<GotchiLendingAdded>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(buildEventParamUint("listingId", tokenId));
    event.parameters.push(buildEventParamAddress("lender", lender));
    event.parameters.push(buildEventParamUint("tokenId", tokenId));
    event.parameters.push(buildEventParamUint("initialCost", initialCost));
    event.parameters.push(buildEventParamUint("period", duration));
    event.parameters.push(buildEventParamUintArray("revenueSplit", revenueSplit));
    event.parameters.push(buildEventParamAddress("originalOwner", lender));
    event.parameters.push(buildEventParamAddress("thirdParty", ZERO_ADDRESS));
    event.parameters.push(buildEventParamUint("whitelistId", "1"));
    event.parameters.push(buildEventParamAddressArray("revenueTokens", revenueTokens));
    event.parameters.push(buildEventParamUint("timeCreated", unixTimestamp));

    handlerCreateAavegotchiRentalOffer(event);

    const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
    assert.fieldEquals("Nft", "AAVEGOTCHI-" + tokenId, "currentRentalOffer", id);
    assert.fieldEquals("RentalOffer", id, "nft", "AAVEGOTCHI-" + tokenId);
    assert.fieldEquals("RentalOffer", id, "lender", lender);
    assert.fieldEquals("RentalOffer", id, "createdAt", unixTimestamp);
    assert.fieldEquals("RentalOffer", id, "duration", duration);
    assert.fieldEquals("RentalOffer", id, "priceAmount", initialCost);
    assert.fieldEquals("RentalOffer", id, "priceAddress", GHST_TOKEN_ADDRESS);

    const profitShareSplitEther = revenueSplit.map<string>(token => BigInt.fromString(token).times(ONE_ETHER).toString());
    assert.fieldEquals("RentalOffer", id, "profitShareSplit", arrayToString(profitShareSplitEther));
    assert.fieldEquals("RentalOffer", id, "profitShareTokens", arrayToString(revenueTokens));
  });

});
