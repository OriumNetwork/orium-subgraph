import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as";
import { handleGotchiLendingExecuted } from "../../../src/aavegotchi";
import { createMockGotchi } from "../../fixture";
import {
  createGotchiLendingExecutedEvent,
  createMockRentalOffer,
} from "../../fixtures/aavegotchi-fixture";
import { BigInt } from "@graphprotocol/graph-ts";
import { loadNft } from "../../../src/utils/misc";

const tokenId = "123";
const nftId = "AAVEGOTCHI-" + tokenId;
const unixTimestamp = "1675888946";
const lender = "0x403e967b044d4be25170310157cb1a4bf10bdd0f";
const borrower = "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8";
const thirdParty = "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8";
const listingId = "23421";
const duration = "10";
const initialCost = "1000";
const revenueTokens = [
  "0x403e967b044d4be25170310157cb1a4bf10bdd0f",
  "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8",
  "0x6a3e7c3c6ef65ee26975b12293ca1aad7e1daed2",
  "0x42e5e06ef5b90fe15f853f59299fc96259209c5c",
];
const revenueSplit = ["60", "30", "10"];
const whitelistId = "1";
const shouldFail = true;

describe("Start a Aavegotchi Rental", () => {
  describe("When entities does not exist", () => {
    test("Should skip to create rental if NFT does not exist", () => {
      const event = createGotchiLendingExecutedEvent(
        tokenId,
        listingId,
        lender,
        borrower,
        thirdParty,
        initialCost,
        duration,
        revenueSplit,
        revenueTokens,
        whitelistId,
        unixTimestamp
      );
      assert.entityCount("Rental", 0);
      handleGotchiLendingExecuted(event);
      assert.entityCount("Rental", 0);
    });
  });
  describe("When entities exists", () => {
    beforeEach(() => {
      const gotchi = createMockGotchi(tokenId);
      const rentalOffer = createMockRentalOffer(
        tokenId,
        lender,
        initialCost,
        duration,
        revenueSplit,
        revenueTokens,
        unixTimestamp
      );

      gotchi.currentRentalOffer = rentalOffer.id;
      gotchi.save();
    });
    test("Should create rental and update currentRental in NFT", () => {
      const event = createGotchiLendingExecutedEvent(
        tokenId,
        listingId,
        lender,
        borrower,
        thirdParty,
        initialCost,
        duration,
        revenueSplit,
        revenueTokens,
        whitelistId,
        unixTimestamp
      );

      const gotchi = loadNft("AAVEGOTCHI", BigInt.fromString(tokenId));
      const rentalOfferId = gotchi.currentRentalOffer;

      handleGotchiLendingExecuted(event);
      const rentalId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;

      assert.fieldEquals("Rental", rentalId, "nft", nftId);
      assert.fieldEquals("Rental", rentalId, "lender", lender);
      assert.fieldEquals(
        "Rental",
        rentalId,
        "start_date",
        event.block.timestamp.toString()
      );
      assert.fieldEquals(
        "Rental",
        rentalId,
        "startedTxHash",
        event.block.hash.toHex()
      );
      assert.fieldEquals("Rental", rentalId, "rentalOffer", rentalOfferId!);

      assert.fieldEquals("Nft", nftId, "currentRental", rentalId);
      assert.fieldEquals("Nft", nftId, "currentRentalOffer", "null");
    });
    test("Should skip to create rental if currentRentalOffer is null in NFT", () => {
      const gotchi = loadNft("AAVEGOTCHI", BigInt.fromString(tokenId));
      gotchi.currentRentalOffer = null;
      gotchi.save();

      const event = createGotchiLendingExecutedEvent(
        tokenId,
        listingId,
        lender,
        borrower,
        thirdParty,
        initialCost,
        duration,
        revenueSplit,
        revenueTokens,
        whitelistId,
        unixTimestamp
      );

      handleGotchiLendingExecuted(event);
    });
    test(
      "Should fail to create rental if currentRental is not null",
      () => {
        const gotchi = loadNft("AAVEGOTCHI", BigInt.fromString(tokenId));
        gotchi.currentRental = "rental";
        gotchi.save();

        const event = createGotchiLendingExecutedEvent(
          tokenId,
          listingId,
          lender,
          borrower,
          thirdParty,
          initialCost,
          duration,
          revenueSplit,
          revenueTokens,
          whitelistId,
          unixTimestamp
        );

        handleGotchiLendingExecuted(event);
      },
      shouldFail
    );
  });
  afterEach(() => {
    clearStore();
  });
});
