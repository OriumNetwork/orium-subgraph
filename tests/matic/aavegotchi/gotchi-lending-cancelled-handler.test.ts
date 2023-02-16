import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as";
import { BigInt } from "@graphprotocol/graph-ts";
import { handleGotchiLendingCancelled } from "../../../src/aavegotchi";
import { createMockGotchi } from "../../fixture";
import {
  createGotchiLendingCancelledEvent,
  createMockRentalOffer,
} from "../../fixtures/aavegotchi-fixture";
import { loadNft } from "../../../src/utils/misc";

const tokenId = "123";
const nftId = "AAVEGOTCHI-" + tokenId;
const unixTimestamp = "1675888946";
const lender = "0x403e967b044d4be25170310157cb1a4bf10bdd0f";
const thirdParty = "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8";
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

describe("Cancel Aavegotchi Rental Offer", () => {
  describe("When entities does not exist", () => {
    test("should skip if rental offer does not exist", () => {
      createMockGotchi(tokenId);

      const event = createGotchiLendingCancelledEvent(
        tokenId,
        lender,
        thirdParty,
        initialCost,
        duration,
        revenueSplit,
        whitelistId,
        revenueTokens,
        unixTimestamp
      );

      handleGotchiLendingCancelled(event);
    });
    test("Should not fail if gotchi does not exist", () => {
      const event = createGotchiLendingCancelledEvent(
        tokenId,
        lender,
        thirdParty,
        initialCost,
        duration,
        revenueSplit,
        whitelistId,
        revenueTokens,
        unixTimestamp
      );

      handleGotchiLendingCancelled(event);
    });
    test(
      "Should fail if gotchi is attched to rental offer that doesn't exists",
      () => {
        const event = createGotchiLendingCancelledEvent(
          tokenId,
          lender,
          thirdParty,
          initialCost,
          duration,
          revenueSplit,
          whitelistId,
          revenueTokens,
          unixTimestamp
        );

        const gotchi = createMockGotchi(tokenId);
        gotchi.currentRentalOffer = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
        gotchi.save();

        handleGotchiLendingCancelled(event);
      },
      true
    );
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

    test("should not fail to remove rental offer from the NFT and update rental offer cancellation", () => {
      const event = createGotchiLendingCancelledEvent(
        tokenId,
        lender,
        thirdParty,
        initialCost,
        duration,
        revenueSplit,
        whitelistId,
        revenueTokens,
        unixTimestamp
      );

      handleGotchiLendingCancelled(event);

      assert.fieldEquals("Nft", nftId, "currentRentalOffer", "null");
    });
    test("Should skip if gotchi and rental offer exist, but rental offer is not attached to gotchi", () => {
      const gotchi = loadNft("AAVEGOTCHI", BigInt.fromString(tokenId));
      gotchi.currentRentalOffer = null;
      gotchi.save();

      const event = createGotchiLendingCancelledEvent(
        tokenId,
        lender,
        thirdParty,
        initialCost,
        duration,
        revenueSplit,
        whitelistId,
        revenueTokens,
        unixTimestamp
      );

      handleGotchiLendingCancelled(event);
    });
  });
  afterEach(() => {
    clearStore();
  });
});
