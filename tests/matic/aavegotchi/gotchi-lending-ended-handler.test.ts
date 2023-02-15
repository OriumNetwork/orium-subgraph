import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as";
import { Nft } from "../../../generated/schema";
import { handleGotchiLendingEnded } from "../../../src/aavegotchi";
import { createMockGotchi } from "../../fixture";
import {
  createGotchiLendingEndedEvent,
  createMockRental,
} from "../../fixtures/aavegotchi-fixture";

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
const startedTxHash = "0x123";
const rentalId = "1";
const shouldFail = true;

describe("End a Aavegotchi Rental", () => {
  describe("When entities does not exist", () => {
    test("Should skip if Nft does not exist", () => {
      const event = createGotchiLendingEndedEvent(
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

      handleGotchiLendingEnded(event);
    });
    test(
      "Should skip if Rental does not exist",
      () => {
        const gotchi = createMockGotchi(tokenId);
        gotchi.currentRental = rentalId;
        gotchi.save();

        const event = createGotchiLendingEndedEvent(
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

        handleGotchiLendingEnded(event);
      },
      shouldFail
    );
  });
  describe("When entities exists", () => {
    beforeEach(() => {
      const gotchi = createMockGotchi(tokenId);
      const rental = createMockRental(
        rentalId,
        nftId,
        lender,
        borrower,
        unixTimestamp,
        startedTxHash
      );

      gotchi.currentRental = rental.id;
      gotchi.save();
    });
    test("Should end rental and update currentRental in NFT", () => {
      const event = createGotchiLendingEndedEvent(
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

      assert.fieldEquals("Nft", nftId, "currentRental", rentalId);

      handleGotchiLendingEnded(event);

      assert.fieldEquals("Nft", nftId, "currentRental", "null");
    });
    test(
      "Should fail if currentRental is null",
      () => {
        const event = createGotchiLendingEndedEvent(
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

        const gotchi = Nft.load(nftId)!;
        gotchi.currentRental = null;
        gotchi.save();

        handleGotchiLendingEnded(event);
      },
      shouldFail
    );
  });
  afterEach(() => {
    clearStore();
  });
});
