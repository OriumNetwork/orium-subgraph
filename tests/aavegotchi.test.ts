import { test, describe, beforeAll, assert, clearStore, newMockEvent, createMockedFunction } from "matchstick-as/assembly/index";
import { Nft, ClaimedToken } from "../generated/schema";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { 
  Transfer,
  PortalOpened,
  ClaimAavegotchi,
  GotchiLendingAdded,
  GotchiLendingCanceled,
  GotchiLendingExecuted,
  GotchiLendingClaimed,
  GotchiLendingEnded,
} from "../generated/AavegotchiDiamond/AavegotchiDiamond"

import { 
  handleFancyBirdsTransfer,
  handleFancyBabyBirdsTransfer,
  handleRealmTransfer,
  handleAavegotchiTransfer,
  handlePortalOpened,
  handleClaimAavegotchi,
  handleGotchiLendingAdded, 
  handleGotchiLendingCanceled,
  handleGotchiLendingExecuted,
  handleGotchiLendingClaimed,
  handleGotchiLendingEnded
} from "../src/orium-handler"

beforeAll(() => {
  let entity = new Nft("AAVEGOTCHI-123")
  entity.currentOwner =  "0x1111111111111111111111111111111111111111"
  entity.previousOwner = "0x0000000000000000000000000000000000000000"
  entity.originalOwner =  "0x1111111111111111111111111111111111111111"
  entity.platform = "Aavegotchi"
  entity.state = "PORTAL"
  entity.type = "AAVEGOTCHI"
  entity.tokenId = BigInt.fromI32(123)
  entity.save()
})

describe("Transfer events", () => {

  test("Transfer existent token", () => {

    let event = changetype<Transfer>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(123)));

    handleAavegotchiTransfer(event)

    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "currentOwner", "0x2222222222222222222222222222222222222222")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "previousOwner","0x1111111111111111111111111111111111111111")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "originalOwner","0x2222222222222222222222222222222222222222")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state","PORTAL")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "type","AAVEGOTCHI")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "tokenId","123")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "platform","Aavegotchi")

  })

  test("Transfer NON-existent token", () => {

    let event = changetype<Transfer>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(333)));

    handleAavegotchiTransfer(event)

    assert.fieldEquals("Nft", "AAVEGOTCHI-333", "currentOwner", "0x2222222222222222222222222222222222222222")
    assert.fieldEquals("Nft", "AAVEGOTCHI-333", "previousOwner","0x1111111111111111111111111111111111111111")

  })

  test("Many transfers in a row", () => {

    let event = changetype<Transfer>(newMockEvent());

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(333)));

    handleAavegotchiTransfer(event)

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(333)));

    handleAavegotchiTransfer(event)

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x4444444444444444444444444444444444444444"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(333)));

    handleAavegotchiTransfer(event)

    assert.fieldEquals("Nft", "AAVEGOTCHI-333", "currentOwner", "0x4444444444444444444444444444444444444444")
    assert.fieldEquals("Nft", "AAVEGOTCHI-333", "previousOwner","0x3333333333333333333333333333333333333333")

  })

  test("Testing 30 transfers to a unique owner", () => {
    let event = changetype<Transfer>(newMockEvent());

    for (let i = 0; i < 30; i++) {
      event.parameters = new Array<ethereum.EventParam>();

      event.parameters.push(new ethereum.EventParam("_from", 
        ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
      event.parameters.push(new ethereum.EventParam("_to", 
        ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))));
      event.parameters.push(new ethereum.EventParam("_tokenId", 
        ethereum.Value.fromI32(100 + i)));

      handleAavegotchiTransfer(event)
    }

    for (let i = 0; i < 30; i++) {
      assert.fieldEquals("Nft", "AAVEGOTCHI-" + (100 + i).toString(), "currentOwner", "0x3333333333333333333333333333333333333333")
      assert.fieldEquals("Nft", "AAVEGOTCHI-" + (100 + i).toString(), "previousOwner","0x2222222222222222222222222222222222222222")
    }

  })

  test("Testing mixed platform transfers", () => {
    let event = changetype<Transfer>(newMockEvent());

    for (let i = 0; i < 30; i++) {
      event.parameters = new Array<ethereum.EventParam>();

      event.parameters.push(new ethereum.EventParam("_from", 
        ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
      event.parameters.push(new ethereum.EventParam("_to", 
        ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))));
      event.parameters.push(new ethereum.EventParam("_tokenId", 
        ethereum.Value.fromI32(100 + i)));

      handleAavegotchiTransfer(event)
    }

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000000"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(110)));
    handleFancyBirdsTransfer(event)

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000000"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x4444444444444444444444444444444444444444"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(120)));
    handleFancyBirdsTransfer(event)

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000000"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x5555555555555555555555555555555555555555"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(115)));
    handleFancyBabyBirdsTransfer(event)

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000000"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x6666666666666666666666666666666666666666"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(115)));
    handleRealmTransfer(event)

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000000"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x7777777777777777777777777777777777777777"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(120)));
    handleRealmTransfer(event)

    for (let i = 0; i < 30; i++) {
      assert.fieldEquals("Nft", "AAVEGOTCHI-" + (100 + i).toString(), "currentOwner", "0x3333333333333333333333333333333333333333")
      assert.fieldEquals("Nft", "AAVEGOTCHI-" + (100 + i).toString(), "previousOwner","0x2222222222222222222222222222222222222222")
    }

    assert.fieldEquals("Nft", "FANCYBIRD-110", "currentOwner", "0x1111111111111111111111111111111111111111")
    assert.fieldEquals("Nft", "FANCYBIRD-110", "previousOwner","0x0000000000000000000000000000000000000000")

    assert.fieldEquals("Nft", "FANCYBIRD-120", "currentOwner", "0x4444444444444444444444444444444444444444")
    assert.fieldEquals("Nft", "FANCYBIRD-120", "previousOwner","0x0000000000000000000000000000000000000000")

    assert.fieldEquals("Nft", "FANCYBABYBIRD-115", "currentOwner", "0x5555555555555555555555555555555555555555")
    assert.fieldEquals("Nft", "FANCYBABYBIRD-115", "previousOwner","0x0000000000000000000000000000000000000000")

    assert.fieldEquals("Nft", "REALM-115", "currentOwner", "0x6666666666666666666666666666666666666666")
    assert.fieldEquals("Nft", "REALM-115", "previousOwner","0x0000000000000000000000000000000000000000")

    assert.fieldEquals("Nft", "REALM-120", "currentOwner", "0x7777777777777777777777777777777777777777")
    assert.fieldEquals("Nft", "REALM-120", "previousOwner","0x0000000000000000000000000000000000000000")
  })

})

describe("Change Aavegotchi STATE events", () => {

  test("Testing PortalOpened", () => {
    let event = changetype<PortalOpened>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("tokenId", 
      ethereum.Value.fromI32(123)));
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "PORTAL")
    handlePortalOpened(event)
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "PORTAL_OPENED")
  })

  test("Testing transfer after PortalOpened", () => {
    let event = changetype<Transfer>(newMockEvent());

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(123)));

    handleAavegotchiTransfer(event)

    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "currentOwner", "0x2222222222222222222222222222222222222222")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "previousOwner","0x1111111111111111111111111111111111111111")
  })

  test("Testing ClaimAavegotchi", () => {
    let event = changetype<ClaimAavegotchi>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(123)));
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "PORTAL_OPENED")
    handleClaimAavegotchi(event)
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "AAVEGOTCHI")
  })

  test("Testing transfer after ClaimAavegotchi", () => {
    let event = changetype<Transfer>(newMockEvent());

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
    event.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))));
    event.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(123)));

    handleAavegotchiTransfer(event)

    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "currentOwner", "0x3333333333333333333333333333333333333333")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "previousOwner","0x2222222222222222222222222222222222222222")
  })

})

describe("Lending events", () => {

  test("Testing handleGotchiLendingAdded", () => {

    let event = changetype<GotchiLendingAdded>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    const revenueSplitArray = [
      BigInt.fromI32(40),
      BigInt.fromI32(50),
      BigInt.fromI32(10),
    ]

    const revenueTokens = [
      Address.fromString("0x4444444444444444444444444444444444444444"),
      Address.fromString("0x5555555555555555555555555555555555555555"),
      Address.fromString("0x6666666666666666666666666666666666666666")
    ]

    event.parameters.push(new ethereum.EventParam("listingId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))));
    event.parameters.push(new ethereum.EventParam("lender", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))))
    event.parameters.push(new ethereum.EventParam("tokenId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))));
    event.parameters.push(new ethereum.EventParam("initialCost", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000))));
    event.parameters.push(new ethereum.EventParam("period", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(16))));
    event.parameters.push(new ethereum.EventParam("revenueSplit", 
      ethereum.Value.fromUnsignedBigIntArray(revenueSplitArray)));
    event.parameters.push(new ethereum.EventParam("originalOwner", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))))
    event.parameters.push(new ethereum.EventParam("thirdParty", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))))
    event.parameters.push(new ethereum.EventParam("whiteListId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(555))));
    event.parameters.push(new ethereum.EventParam("revenueTokens", 
      ethereum.Value.fromAddressArray(revenueTokens)))
    event.parameters.push(new ethereum.EventParam("timeCreated", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(11111))));

    handleGotchiLendingAdded(event)

    assert.fieldEquals("Rental", "100", "nftEntity", "AAVEGOTCHI-123")
    assert.fieldEquals("Rental", "100", "lender",     "0x1111111111111111111111111111111111111111")
    assert.fieldEquals("Rental", "100", "tokenId",    "123")
    assert.fieldEquals("Rental", "100", "initialCost","10000")
    assert.fieldEquals("Rental", "100", "period","16")
    assert.fieldEquals("Rental", "100", "thirdParty", "0x3333333333333333333333333333333333333333")
    assert.fieldEquals("Rental", "100", "timeCreated", "11111")

  })

  test("Testing handleGotchiLendingCanceled", () => {
    let event = changetype<GotchiLendingCanceled>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    const revenueSplitArray = [
      BigInt.fromI32(40),
      BigInt.fromI32(50),
      BigInt.fromI32(10),
    ]

    const revenueTokens = [
      Address.fromString("0x4444444444444444444444444444444444444444"),
      Address.fromString("0x5555555555555555555555555555555555555555"),
      Address.fromString("0x6666666666666666666666666666666666666666")
    ]

    event.parameters.push(new ethereum.EventParam("listingId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))));
    event.parameters.push(new ethereum.EventParam("lender", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))))
    event.parameters.push(new ethereum.EventParam("tokenId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))));
    event.parameters.push(new ethereum.EventParam("initialCost", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000))));
    event.parameters.push(new ethereum.EventParam("period", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(16))));
    event.parameters.push(new ethereum.EventParam("revenueSplit", 
      ethereum.Value.fromUnsignedBigIntArray(revenueSplitArray)));
    event.parameters.push(new ethereum.EventParam("originalOwner", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))))
    event.parameters.push(new ethereum.EventParam("thirdParty", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))))
    event.parameters.push(new ethereum.EventParam("whiteListId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(555))));
    event.parameters.push(new ethereum.EventParam("revenueTokens", 
      ethereum.Value.fromAddressArray(revenueTokens)))
    event.parameters.push(new ethereum.EventParam("timeCanceled", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(22222))));

    handleGotchiLendingCanceled(event)

    assert.fieldEquals("Rental", "100", "nftEntity", "AAVEGOTCHI-123")
    assert.fieldEquals("Rental", "100", "timeCanceled", "22222")
    assert.fieldEquals("Rental", "100", "canceled", "true")
    assert.fieldEquals("Rental", "100", "completed", "false")
  })

  test("Testing setting of 'originalOwner' field", () => {

    let event2 = changetype<Transfer>(newMockEvent());
    event2.parameters = new Array<ethereum.EventParam>();

    event2.parameters.push(new ethereum.EventParam("_from", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))));
    event2.parameters.push(new ethereum.EventParam("_to", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))));
    event2.parameters.push(new ethereum.EventParam("_tokenId", 
      ethereum.Value.fromI32(123)));

    handleAavegotchiTransfer(event2)

    let event = changetype<GotchiLendingExecuted>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    const revenueSplitArray = [
      BigInt.fromI32(40),
      BigInt.fromI32(50),
      BigInt.fromI32(10),
    ]

    const revenueTokens = [
      Address.fromString("0x4444444444444444444444444444444444444444"),
      Address.fromString("0x5555555555555555555555555555555555555555"),
      Address.fromString("0x6666666666666666666666666666666666666666")
    ]

    event.parameters.push(new ethereum.EventParam("listingId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))));
    event.parameters.push(new ethereum.EventParam("lender", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))))
    event.parameters.push(new ethereum.EventParam("borrower", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))))

    event.parameters.push(new ethereum.EventParam("tokenId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))));
    event.parameters.push(new ethereum.EventParam("initialCost", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000))));
    event.parameters.push(new ethereum.EventParam("period", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(16))));
    event.parameters.push(new ethereum.EventParam("revenueSplit", 
      ethereum.Value.fromUnsignedBigIntArray(revenueSplitArray)));
    event.parameters.push(new ethereum.EventParam("originalOwner", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))))
    event.parameters.push(new ethereum.EventParam("thirdParty", 
      ethereum.Value.fromAddress(Address.fromString("0x4444444444444444444444444444444444444444"))))
    event.parameters.push(new ethereum.EventParam("whiteListId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(555))));
    event.parameters.push(new ethereum.EventParam("revenueTokens", 
      ethereum.Value.fromAddressArray(revenueTokens)))
    event.parameters.push(new ethereum.EventParam("timeAgreed", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(33333))));

    handleGotchiLendingExecuted(event)

    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "originalOwner", "0x1111111111111111111111111111111111111111")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "previousOwner", "0x1111111111111111111111111111111111111111")
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "currentOwner",  "0x2222222222222222222222222222222222222222")
  })

  test("Testing handleGotchiLendingExecuted", () => {
    let event = changetype<GotchiLendingExecuted>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    const revenueSplitArray = [
      BigInt.fromI32(40),
      BigInt.fromI32(50),
      BigInt.fromI32(10),
    ]

    const revenueTokens = [
      Address.fromString("0x4444444444444444444444444444444444444444"),
      Address.fromString("0x5555555555555555555555555555555555555555"),
      Address.fromString("0x6666666666666666666666666666666666666666")
    ]

    event.parameters.push(new ethereum.EventParam("listingId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))));
    event.parameters.push(new ethereum.EventParam("lender", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))))
    event.parameters.push(new ethereum.EventParam("borrower", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))))

    event.parameters.push(new ethereum.EventParam("tokenId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))));
    event.parameters.push(new ethereum.EventParam("initialCost", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000))));
    event.parameters.push(new ethereum.EventParam("period", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(16))));
    event.parameters.push(new ethereum.EventParam("revenueSplit", 
      ethereum.Value.fromUnsignedBigIntArray(revenueSplitArray)));
    event.parameters.push(new ethereum.EventParam("originalOwner", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))))
    event.parameters.push(new ethereum.EventParam("thirdParty", 
      ethereum.Value.fromAddress(Address.fromString("0x4444444444444444444444444444444444444444"))))
    event.parameters.push(new ethereum.EventParam("whiteListId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(555))));
    event.parameters.push(new ethereum.EventParam("revenueTokens", 
      ethereum.Value.fromAddressArray(revenueTokens)))
    event.parameters.push(new ethereum.EventParam("timeAgreed", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(33333))));

    handleGotchiLendingExecuted(event)

    assert.fieldEquals("Rental", "100", "nftEntity", "AAVEGOTCHI-123")
    assert.fieldEquals("Rental", "100", "timeAgreed", "33333")
  })

  test("Testing handleGotchiLendingEnded", () => {
    let event = changetype<GotchiLendingEnded>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    const revenueSplitArray = [
      BigInt.fromI32(40),
      BigInt.fromI32(50),
      BigInt.fromI32(10),
    ]

    const revenueTokens = [
      Address.fromString("0x4444444444444444444444444444444444444444"),
      Address.fromString("0x5555555555555555555555555555555555555555"),
      Address.fromString("0x6666666666666666666666666666666666666666")
    ]

    event.parameters.push(new ethereum.EventParam("listingId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))));
    event.parameters.push(new ethereum.EventParam("lender", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))))
    event.parameters.push(new ethereum.EventParam("borrower", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))))

    event.parameters.push(new ethereum.EventParam("tokenId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))));
    event.parameters.push(new ethereum.EventParam("initialCost", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000))));
    event.parameters.push(new ethereum.EventParam("period", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(16))));
    event.parameters.push(new ethereum.EventParam("revenueSplit", 
      ethereum.Value.fromUnsignedBigIntArray(revenueSplitArray)));
    event.parameters.push(new ethereum.EventParam("originalOwner", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))))
    event.parameters.push(new ethereum.EventParam("thirdParty", 
      ethereum.Value.fromAddress(Address.fromString("0x4444444444444444444444444444444444444444"))))
    event.parameters.push(new ethereum.EventParam("whiteListId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(555))));
    event.parameters.push(new ethereum.EventParam("revenueTokens", 
      ethereum.Value.fromAddressArray(revenueTokens)))
    event.parameters.push(new ethereum.EventParam("timeEnded", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(44444))));

    handleGotchiLendingEnded(event)

    assert.fieldEquals("Rental", "100", "nftEntity", "AAVEGOTCHI-123")
    assert.fieldEquals("Rental", "100", "timeEnded", "44444")
  })

  test("Testing handleGotchiLendingClaimed", () => {
    let event = changetype<GotchiLendingClaimed>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    const revenueSplitArray = [
      BigInt.fromI32(40),
      BigInt.fromI32(50),
      BigInt.fromI32(10),
    ]

    const revenueTokens = [
      Address.fromString("0x7777777777777777777777777777777777777777"),
      Address.fromString("0x8888888888888888888888888888888888888888"),
      Address.fromString("0x9999999999999999999999999999999999999999")
    ]

    const amounts = [
      BigInt.fromI32(777),
      BigInt.fromI32(888),
      BigInt.fromI32(999),
    ]

    event.parameters.push(new ethereum.EventParam("listingId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))));
    event.parameters.push(new ethereum.EventParam("lender", 
      ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))))
    event.parameters.push(new ethereum.EventParam("borrower", 
      ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))))

    event.parameters.push(new ethereum.EventParam("tokenId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))));
    event.parameters.push(new ethereum.EventParam("initialCost", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000))));
    event.parameters.push(new ethereum.EventParam("period", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(16))));
    event.parameters.push(new ethereum.EventParam("revenueSplit", 
      ethereum.Value.fromUnsignedBigIntArray(revenueSplitArray)));
    event.parameters.push(new ethereum.EventParam("originalOwner", 
      ethereum.Value.fromAddress(Address.fromString("0x3333333333333333333333333333333333333333"))))
    event.parameters.push(new ethereum.EventParam("thirdParty", 
      ethereum.Value.fromAddress(Address.fromString("0x4444444444444444444444444444444444444444"))))
    event.parameters.push(new ethereum.EventParam("whiteListId", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(555))));
    event.parameters.push(new ethereum.EventParam("revenueTokens", 
      ethereum.Value.fromAddressArray(revenueTokens)))
    event.parameters.push(new ethereum.EventParam("amounts", 
      ethereum.Value.fromUnsignedBigIntArray(amounts)))
    event.parameters.push(new ethereum.EventParam("timeClaimed", 
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(55555))));

    handleGotchiLendingClaimed(event)

    assert.fieldEquals("Rental", "100", "timeClaimed", "55555")

    assert.fieldEquals("ClaimedToken", "0x7777777777777777777777777777777777777777"+ "-100", "rental", "100")
    assert.fieldEquals("ClaimedToken", "0x7777777777777777777777777777777777777777"+ "-100", "token", "0x7777777777777777777777777777777777777777")
    assert.fieldEquals("ClaimedToken", "0x7777777777777777777777777777777777777777"+ "-100", "amount", "777")

    assert.fieldEquals("ClaimedToken", "0x8888888888888888888888888888888888888888"+ "-100", "rental", "100")
    assert.fieldEquals("ClaimedToken", "0x8888888888888888888888888888888888888888"+ "-100", "token", "0x8888888888888888888888888888888888888888")
    assert.fieldEquals("ClaimedToken", "0x8888888888888888888888888888888888888888"+ "-100", "amount", "888")

    assert.fieldEquals("ClaimedToken", "0x9999999999999999999999999999999999999999"+ "-100", "rental", "100")
    assert.fieldEquals("ClaimedToken", "0x9999999999999999999999999999999999999999"+ "-100", "token", "0x9999999999999999999999999999999999999999")
    assert.fieldEquals("ClaimedToken", "0x9999999999999999999999999999999999999999"+ "-100", "amount", "999")

  })
})
