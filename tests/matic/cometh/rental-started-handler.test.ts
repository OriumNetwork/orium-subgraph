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
import { createRentalStartedEvent } from "../../fixtures/cometh-fixture";
import { ComethNFT } from "../../../src/utils/types";
import { SPACESHIP_ADDRESS } from "../../../src/utils/addresses";
import { handleRentalStarted } from "../../../src/cometh";
import { createMockRentalOffer, createMockSpaceship } from "../../fixture";
import { COMETHSPACESHIP } from "../../../src/utils/constants";

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
const deadline = "1675888946";
const start = "1675888946";
const end = BigInt.fromString(deadline)
  .plus(BigInt.fromString(nfts[0].duration))
  .toString();
const feeToken = "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8";
const feeAmount = "1000000000000000000";
const shouldFail = true;

describe("Cometh - Rental Started", () => {
  describe("When entities does not exist", () => {
    test("Should skip to create rental if NFT does not exist", () => {
      const event = createRentalStartedEvent(
        nonce,
        maker,
        taker,
        nfts[0].token,
        nfts[0].tokenId,
        nfts[0].duration,
        nfts[0].basisPoints,
        start,
        end
      );
      assert.entityCount("Rental", 0);
      handleRentalStarted(event);
      assert.entityCount("Rental", 0);
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

      nft.currentRentalOffer = rentalOffer.id;
      nft.save();
    });
    test("Should create rental and update currentRental in NFT", () => {
      const event = createRentalStartedEvent(
        nonce,
        maker,
        taker,
        nfts[0].token,
        nfts[0].tokenId,
        nfts[0].duration,
        nfts[0].basisPoints,
        start,
        end
      );
      event.transaction.from = Address.fromString(maker);

      const gotchi = loadNft(COMETHSPACESHIP, BigInt.fromString(tokenId));
      const rentalOfferId = gotchi.currentRentalOffer;

      handleRentalStarted(event);
      const rentalId = `${maker}-${nonce}`;

      assert.fieldEquals("Rental", rentalId, "nft", nftId);
      assert.fieldEquals("Rental", rentalId, "lender", maker);
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
      const nft = loadNft(COMETHSPACESHIP, BigInt.fromString(tokenId));
      nft.currentRentalOffer = null;
      nft.save();

      const event = createRentalStartedEvent(
        nonce,
        maker,
        taker,
        nfts[0].token,
        nfts[0].tokenId,
        nfts[0].duration,
        nfts[0].basisPoints,
        start,
        end
      );

      handleRentalStarted(event);
    });
    test(
      "Should fail to create rental if currentRental is not null",
      () => {
        const nft = loadNft(COMETHSPACESHIP, BigInt.fromString(tokenId));
        nft.currentRental = "rental";
        nft.save();

        const event = createRentalStartedEvent(
          nonce,
          maker,
          taker,
          nfts[0].token,
          nfts[0].tokenId,
          nfts[0].duration,
          nfts[0].basisPoints,
          start,
          end
        );

        handleRentalStarted(event);
      },
      shouldFail
    );
  });
  afterEach(() => {
    clearStore();
  });
});
