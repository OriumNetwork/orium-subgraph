import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as";
import { Nft } from "../../../generated/schema";
import { SPACESHIP_ADDRESS } from "../../../src/utils/addresses";
import { COMETHSPACESHIP } from "../../../src/utils/constants";
import { ComethNFT } from "../../../src/utils/types";
import { createRentalEndedEvent } from "../../fixtures/cometh-fixture";
import { handleRentalEnded } from "../../../src/cometh";
import { createMockRental, createMockSpaceship } from "../../fixture";

const tokenId = "123";
const nftId = `${COMETHSPACESHIP}-${tokenId}`;
const nonce = "1675888946";
const maker = "0x403e967b044d4be25170310157cb1a4bf10bdd0f";
const taker = "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8";
const rentalId = `${maker}-${nonce}`;
let nfts: ComethNFT[] = [
  {
    token: SPACESHIP_ADDRESS,
    tokenId: tokenId,
    duration: "86400",
    basisPoints: "10000",
  },
];
const start = "1675888946";
const shouldFail = true;

describe("End a Aavenft Rental", () => {
  describe("When entities does not exist", () => {
    test("Should fail if Nft does not exist", () => {
      const event = createRentalEndedEvent(
        maker,
        taker,
        nfts[0].token,
        nfts[0].tokenId
      );

      handleRentalEnded(event);
    }, shouldFail);
    test(
      "Should skip if Rental does not exist",
      () => {
        const nft = createMockSpaceship(tokenId);
        nft.currentRental = rentalId;
        nft.save();

        const event = createRentalEndedEvent(
          maker,
          taker,
          nfts[0].token,
          nfts[0].tokenId
        );

        handleRentalEnded(event);
      },
      shouldFail
    );
  });
  describe("When entities exists", () => {
    beforeEach(() => {
      const nft = createMockSpaceship(tokenId);
      const rental = createMockRental(
        rentalId,
        nftId,
        maker,
        taker,
        start,
        "0x",
        null,
        null,
        null
      );

      nft.currentRental = rental.id;
      nft.save();
    });
    test("Should end rental and update currentRental in NFT", () => {
      const event = createRentalEndedEvent(
        maker,
        taker,
        nfts[0].token,
        nfts[0].tokenId
      );

      assert.fieldEquals("Nft", nftId, "currentRental", rentalId);

      handleRentalEnded(event);

      assert.fieldEquals("Nft", nftId, "currentRental", "null");
    });
    test("Should fail if currentRental is null", () => {
      const event = createRentalEndedEvent(
        maker,
        taker,
        nfts[0].token,
        nfts[0].tokenId
      );

      const nft = Nft.load(nftId)!;
      nft.currentRental = null;
      nft.save();

      assert.fieldEquals("Nft", nftId, "currentRental", "null");
      handleRentalEnded(event);
      assert.fieldEquals("Nft", nftId, "currentRental", "null");
    }, shouldFail);
  });
  afterEach(() => {
    clearStore();
  });
});
