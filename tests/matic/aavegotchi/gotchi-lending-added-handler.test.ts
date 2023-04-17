import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as";
import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_ADDRESS, ONE_ETHER } from "../../../src/utils/constants";
import { handleGotchiLendingAdded } from "../../../src/aavegotchi";
import { GHST_TOKEN_ADDRESS } from "../../../src/utils/addresses";
import { arrayToString, createMockGotchi } from "../../fixture";
import { createGotchiLendingAddedEvent } from "../../fixtures/aavegotchi-fixture";

const tokenId = "123";
const unixTimestamp = "1675888946";
const lender = "0x403e967b044d4be25170310157cb1a4bf10bdd0f";
const duration = "10";
const initialCost = "1000";
const revenueTokens = [
  "0x403e967b044d4be25170310157cb1a4bf10bdd0f",
  "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8",
  "0x6a3e7c3c6ef65ee26975b12293ca1aad7e1daed2",
  "0x42e5e06ef5b90fe15f853f59299fc96259209c5c",
];

describe("Aavegotchi Rentals", () => {
  beforeEach(() => {
    createMockGotchi(tokenId);
  });

  afterEach(() => {
    clearStore();
  });

  test("Testing Create Rental Offer without Third-Party", () => {
    const revenueSplit = ["60", "40"];

    const event = createGotchiLendingAddedEvent(
      tokenId,
      lender,
      ZERO_ADDRESS,
      initialCost,
      duration,
      revenueSplit,
      revenueTokens,
      unixTimestamp
    );

    handleGotchiLendingAdded(event);

    const rentalOfferId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
    const nftId = "AAVEGOTCHI-" + tokenId;
    assert.fieldEquals("Nft", nftId, "currentRentalOffer", rentalOfferId);
    assert.fieldEquals("Nft", nftId, "rentalOfferHistory", `[${rentalOfferId}]`);
    assert.fieldEquals("RentalOffer", rentalOfferId, "nfts", `[${nftId}]`);
    assert.fieldEquals("RentalOffer", rentalOfferId, "lender", lender);
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "createdAt",
      unixTimestamp
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "duration",
      `[${duration}]`
    );
    assert.fieldEquals("RentalOffer", rentalOfferId, "feeAmount", initialCost);
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "feeToken",
      GHST_TOKEN_ADDRESS
    );

    const profitShareSplitEther = revenueSplit.map<string>((token) =>
      BigInt.fromString(token)
        .times(ONE_ETHER)
        .toString()
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "profitShareSplit",
      arrayToString(profitShareSplitEther)
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "profitShareTokens",
      arrayToString(revenueTokens)
    );
  });

  test("Testing Create Rental Offer with Third-Party", () => {
    const revenueSplit = ["60", "30", "10"];

    const event = createGotchiLendingAddedEvent(
      tokenId,
      lender,
      ZERO_ADDRESS,
      initialCost,
      duration,
      revenueSplit,
      revenueTokens,
      unixTimestamp
    );

    handleGotchiLendingAdded(event);

    const rentalOfferId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
    const nftId = "AAVEGOTCHI-" + tokenId;

    assert.fieldEquals("Nft", nftId, "currentRentalOffer", rentalOfferId);
    assert.fieldEquals("Nft", nftId, "rentalOfferHistory", `[${rentalOfferId}]`);
    assert.fieldEquals("RentalOffer", rentalOfferId, "nfts", `[${nftId}]`);
    assert.fieldEquals("RentalOffer", rentalOfferId, "lender", lender);
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "createdAt",
      unixTimestamp
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "duration",
      `[${duration}]`
    );
    assert.fieldEquals("RentalOffer", rentalOfferId, "feeAmount", initialCost);
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "feeToken",
      GHST_TOKEN_ADDRESS
    );

    const profitShareSplitEther = revenueSplit.map<string>((token) =>
      BigInt.fromString(token)
        .times(ONE_ETHER)
        .toString()
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "profitShareSplit",
      arrayToString(profitShareSplitEther)
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "profitShareTokens",
      arrayToString(revenueTokens)
    );
  });
});
