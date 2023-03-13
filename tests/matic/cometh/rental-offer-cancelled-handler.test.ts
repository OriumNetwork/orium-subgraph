import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { loadNft } from "../../../src/utils/misc";
import { COMETHSPACESHIP } from "../../../src/utils/constants";
import { SPACESHIP_ADDRESS } from "../../../src/utils/addresses";
import { ComethNFT } from "../../../src/utils/types";
import { createMockRentalOffer, createMockSpaceship } from "../../fixture";
import { createRentalOfferCancelledEvent } from "../../fixtures/cometh-fixture";
import { handleRentalOfferCancelled } from "../../../src/cometh";

const tokenId = "123";
const nftId = `${COMETHSPACESHIP}-${tokenId}`;
const nonce = "1675888946";
const maker = "0x403e967b044d4be25170310157cb1a4bf10bdd0f";
const taker = "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8";
let nfts: ComethNFT[] = [
  {
    token: SPACESHIP_ADDRESS,
    tokenId: tokenId,
    duration: "86400",
    basisPoints: "10000",
  },
];
const feeToken = "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8";
const feeAmount = "1000000000000000000";
const deadline = "1675888946";
const rentalOfferId = `${maker}-${nonce}`;

describe("Cometh - Rental Offer Cancelled Event", () => {
  describe("When entities does not exist", () => {
    test("should skip if rental offer does not exist", () => {
      createMockSpaceship(tokenId);

      const event = createRentalOfferCancelledEvent(nonce, maker);

      handleRentalOfferCancelled(event);
    });
    test("Should not fail if NFT does not exist", () => {
      const event = createRentalOfferCancelledEvent(nonce, maker);

      handleRentalOfferCancelled(event);
    });
    test("Should skip if NFT is attched to rental offer that doesn't exists", () => {
      const event = createRentalOfferCancelledEvent(nonce, maker);

      assert.notInStore("RentalOffer", rentalOfferId);
      handleRentalOfferCancelled(event);
      assert.notInStore("RentalOffer", rentalOfferId);
    });
  });
  describe("When entities exists", () => {
    beforeEach(() => {
      const nft = createMockSpaceship(tokenId);
      const rentalOffer = createMockRentalOffer(
        nftId,
        taker,
        feeToken,
        feeAmount,
        nfts[0].duration,
        [nfts[0].basisPoints],
        [feeToken],
        deadline
      );

      rentalOffer.id = rentalOfferId;
      rentalOffer.save();

      nft.currentRentalOffer = rentalOfferId;
      nft.save();
    });

    test("should not fail to remove rental offer from the NFT and update rental offer cancellation", () => {
      const event = createRentalOfferCancelledEvent(nonce, maker);

      assert.fieldEquals("Nft", nftId, "currentRentalOffer", rentalOfferId);

      handleRentalOfferCancelled(event);

      assert.fieldEquals("Nft", nftId, "currentRentalOffer", "null");
    });
    test("Should skip if NFT and rental offer exist, but rental offer is not attached to NFT", () => {
      const nft = loadNft(COMETHSPACESHIP, BigInt.fromString(tokenId));
      nft.currentRentalOffer = null;
      nft.save();

      const event = createRentalOfferCancelledEvent(nonce, maker);

      handleRentalOfferCancelled(event);
    });
  });
  afterEach(() => {
    clearStore();
  });
});
