import { test, assert, clearStore, newMockEvent, createMockedFunction } from "matchstick-as/assembly/index";
import { NftEntity, Control, ClaimedToken } from "../generated/schema";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { 
  GotchiLendingAdd,
  GotchiLendingCancel,
  GotchiLendingExecute,
  GotchiLendingClaim,
} from "../generated/AavegotchiDiamond/AavegotchiDiamond"

import { 
  handleGotchiLendingAdd, 
  handleGotchiLendingCancel,
  handleGotchiLendingExecute,
  handleGotchiLendingClaim,
} from "../src/orium-handler"

test("Testing handleGotchiLendingAdd", () => {
  let addrFrom = Address.fromString("0xeb5bc717762e66b23395922cbed3e7a75434bf1c")
  let addrTo   = Address.fromString("0x77e33321514dec07aae86c6dfcefc54801ad19e0")

  let entity = new NftEntity("Aavegotchi-123")
  entity.currentOwner = addrFrom.toString()
  entity.platform = "Aavegotchi"
  entity.tokenId = BigInt.fromI32(123)
  entity.save()

  let newMockevent = newMockEvent();
  let contractAddress = newMockevent.address
  let event = new GotchiLendingAdd(
      newMockevent.address,
      newMockevent.logIndex,
      newMockevent.transactionLogIndex,
      newMockevent.logType,
      newMockevent.block,
      newMockevent.transaction,
      newMockevent.parameters
  );
  event.parameters = new Array<ethereum.EventParam>();

  let listingId = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))

  let listingIdp = new ethereum.EventParam("listingId", listingId)
  event.parameters.push(listingIdp);

  let one = BigInt.fromI32(1)
  let evOne = ethereum.Value.fromSignedBigInt(BigInt.fromI32(1))
  let evAddr = ethereum.Value.fromAddress(addrFrom)
  let evFalse = ethereum.Value.fromBoolean(false)
  let evTrue  = ethereum.Value.fromBoolean(true)

  let lender     = ethereum.Value.fromAddress(Address.fromString("0x1111111111111111111111111111111111111111"))
  let thirdParty = ethereum.Value.fromAddress(Address.fromString("0x2222222222222222222222222222222222222222"))
  let timeCreated = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(555))
  let upfrontCost = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(777))
  let period = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(888))
  let tokenId = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))

  createMockedFunction(contractAddress, 
    "getGotchiLendingListingInfo", 
    "getGotchiLendingListingInfo(uint32):(" + 
      // Struct GotchiLending
      "(address,uint96,address,uint32,uint32,uint32,address,uint40,uint40,bool,bool,address,uint8[3],uint40,uint32,address[])," + 
      // Struct AavegotchiInfo
      "(uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))])
  .returns([
    ethereum.Value.fromTuple(changetype<ethereum.Tuple>([
      lender,
      upfrontCost,
      evAddr,
      listingId,
      tokenId,
      evOne,
      evAddr,
      timeCreated,
      evOne,
      evTrue,
      evTrue,
      thirdParty,
      ethereum.Value.fromUnsignedBigIntArray([one, one, one]),
      evOne,
      period,
      ethereum.Value.fromAddressArray([addrFrom, addrFrom, addrFrom])
    ])),
    ethereum.Value.fromTuple(changetype<ethereum.Tuple>([]))
  ])

  handleGotchiLendingAdd(event)

  assert.fieldEquals("Rental", "100", "nftEntity", "Aavegotchi-123")
  assert.fieldEquals("Rental", "100", "lender",     "0x1111111111111111111111111111111111111111")
  assert.fieldEquals("Rental", "100", "thirdParty", "0x2222222222222222222222222222222222222222")
  assert.fieldEquals("Rental", "100", "period", "888")
  assert.fieldEquals("Rental", "100", "upfrontCost", "777")
  assert.fieldEquals("Rental", "100", "timeCreated", "555")
  assert.fieldEquals("Rental", "100", "completed", "false")
  assert.fieldEquals("Rental", "100", "cancelled", "false")

})

test("Testing handleGotchiLendingCancel", () => {
  let newMockevent = newMockEvent();
  let event = new GotchiLendingCancel(
      newMockevent.address,
      newMockevent.logIndex,
      newMockevent.transactionLogIndex,
      newMockevent.logType,
      newMockevent.block,
      newMockevent.transaction,
      newMockevent.parameters
  );
  event.parameters = new Array<ethereum.EventParam>();

  let listingId = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))
  let listingIdp = new ethereum.EventParam("listingId", listingId)
  event.parameters.push(listingIdp);
  event.block.timestamp = BigInt.fromI32(333)

  handleGotchiLendingCancel(event)

  assert.fieldEquals("Rental", "100", "cancelled", "true")
  assert.fieldEquals("Rental", "100", "timeEnded", "333")
})

test("Testing handleGotchiLendingExecute", () => {
  let newMockevent = newMockEvent();
  let event = new GotchiLendingExecute(
      newMockevent.address,
      newMockevent.logIndex,
      newMockevent.transactionLogIndex,
      newMockevent.logType,
      newMockevent.block,
      newMockevent.transaction,
      newMockevent.parameters
  );
  event.parameters = new Array<ethereum.EventParam>();

  let listingId = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))
  let listingIdp = new ethereum.EventParam("listingId", listingId)
  event.parameters.push(listingIdp);

  event.block.timestamp = BigInt.fromI32(2345)

  let control = new Control('orium-control')
  control.lastNftTransferred = "Aavegotchi-123"
  control.save()

  let current  = Address.fromString("0x2222222222222222222222222222222222222222")
  let previous = Address.fromString("0x1111111111111111111111111111111111111111")
  let entity = NftEntity.load("Aavegotchi-123")
  if (entity) {
    entity.currentOwner = current.toHex()
    entity.previousOwner = previous.toHex()
    entity.save()
  } else {
    assert.assertTrue(false)
  }

  assert.fieldEquals("NftEntity", "Aavegotchi-123", "currentOwner", "0x2222222222222222222222222222222222222222")

  handleGotchiLendingExecute(event)

  assert.fieldEquals("Rental", "100", "borrower", "0x2222222222222222222222222222222222222222")
  assert.fieldEquals("Rental", "100", "timeAgreed", "2345")
  assert.fieldEquals("NftEntity", "Aavegotchi-123", "currentOwner", "0x1111111111111111111111111111111111111111")

})

test("Testing handleGotchiLendingClaim", () => {
  let newMockevent = newMockEvent();
  let event = new GotchiLendingClaim(
      newMockevent.address,
      newMockevent.logIndex,
      newMockevent.transactionLogIndex,
      newMockevent.logType,
      newMockevent.block,
      newMockevent.transaction,
      newMockevent.parameters
  );
  event.parameters = new Array<ethereum.EventParam>();

  let listingId = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))
  let listingIdp = new ethereum.EventParam("listingId", listingId)
  event.parameters.push(listingIdp);

  let token1 = Address.fromString("0x1111111111111111111111111111111111111111")
  let token2 = Address.fromString("0x2222222222222222222222222222222222222222")
  let token3 = Address.fromString("0x3333333333333333333333333333333333333333")

  let amount1 = BigInt.fromI32(111)
  let amount2 = BigInt.fromI32(222)
  let amount3 = BigInt.fromI32(333)

  let tokenAddresses = new ethereum.EventParam('tokenAddresses', ethereum.Value.fromAddressArray([token1, token2, token3]))
  event.parameters.push(tokenAddresses)
  let amounts = new ethereum.EventParam('amounts', ethereum.Value.fromUnsignedBigIntArray([amount1, amount2, amount3]))
  event.parameters.push(amounts)

  event.block.timestamp = BigInt.fromI32(2345)

  handleGotchiLendingClaim(event)

  assert.fieldEquals("Rental", "100", "lastClaimed", "2345")

  assert.fieldEquals("ClaimedToken", token1.toHex() + "-100", "rental", "100")
  assert.fieldEquals("ClaimedToken", token1.toHex() + "-100", "token", token1.toHex())
  assert.fieldEquals("ClaimedToken", token1.toHex() + "-100", "amount", "111")

  assert.fieldEquals("ClaimedToken", token2.toHex() + "-100", "rental", "100")
  assert.fieldEquals("ClaimedToken", token2.toHex() + "-100", "token", token2.toHex())
  assert.fieldEquals("ClaimedToken", token2.toHex() + "-100", "amount", "222")

  assert.fieldEquals("ClaimedToken", token3.toHex() + "-100", "rental", "100")
  assert.fieldEquals("ClaimedToken", token3.toHex() + "-100", "token", token3.toHex())
  assert.fieldEquals("ClaimedToken", token3.toHex() + "-100", "amount", "333")
})
