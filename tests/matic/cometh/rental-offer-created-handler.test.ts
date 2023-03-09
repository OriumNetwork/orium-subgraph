import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as";
import { COMETHSPACESHIP, ZERO_ADDRESS } from "../../../src/utils/constants";
import { createMockSpaceship } from "../../fixture";
import { createRentalOfferCreatedEvent } from "../../fixtures/cometh-fixture";
import { handleRentalOfferCreated } from "../../../src/cometh";
import { ComethNFT } from "../../../src/utils/types";
import { SPACESHIP_ADDRESS } from "../../../src/utils/addresses";

const tokenId = "123";
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

describe("Cometh - Create Rental Offer", () => {
  beforeEach(() => {
    createMockSpaceship(tokenId);
  });

  afterEach(() => {
    clearStore();
  });

  test("Should create cometh rental offer", () => {
    const event = createRentalOfferCreatedEvent(
      nonce,
      maker,
      taker,
      nfts,
      feeToken,
      feeAmount,
      deadline
    );

    handleRentalOfferCreated(event);

    const rentalOfferId = `${event.transaction.from.toHexString()}-${nonce}`;
    const nftId = `${COMETHSPACESHIP}-${tokenId}`;

    assert.fieldEquals("Nft", nftId, "currentRentalOffer", rentalOfferId);
    assert.fieldEquals("RentalOffer", rentalOfferId, "nfts", `[${nftId}]`);
    assert.fieldEquals("RentalOffer", rentalOfferId, "lender", maker);
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "createdAt",
      event.block.timestamp.toString()
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "creationTxHash",
      event.transaction.hash.toHexString()
    );
    assert.fieldEquals(
      "RentalOffer",
      rentalOfferId,
      "duration",
      `[${nfts[0].duration}]`
    );
    assert.fieldEquals("RentalOffer", rentalOfferId, "feeToken", feeToken);
    assert.fieldEquals("RentalOffer", rentalOfferId, "feeAmount", feeAmount);
  });
  test("Should skip create cometh rental offer if token id is invalid", () => {
    const invalidTokenId = "0";
    nfts[0].tokenId = invalidTokenId;
    const event = createRentalOfferCreatedEvent(
      nonce,
      maker,
      taker,
      nfts,
      feeToken,
      feeAmount,
      deadline
    );
    assert.entityCount("RentalOffer", 0);
    handleRentalOfferCreated(event);
    assert.entityCount("RentalOffer", 0);
  });
  test("Should skip create cometh rental offer if token address is invalid", () => {
    nfts[0].token = ZERO_ADDRESS;
    const event = createRentalOfferCreatedEvent(
      nonce,
      maker,
      taker,
      nfts,
      feeToken,
      feeAmount,
      deadline
    );
    assert.entityCount("RentalOffer", 0);
    handleRentalOfferCreated(event);
    assert.entityCount("RentalOffer", 0);
  });
});
