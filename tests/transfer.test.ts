import { test, assert, clearStore, newMockEvent, createMockedFunction } from "matchstick-as/assembly/index";
import { Transfer } from "../generated/AavegotchiDiamond/AavegotchiDiamond"
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { handleAavegotchiTransfer } from "../src/orium-handler"
import { NftEntity, Control } from "../generated/schema";

test("Testing handleTransfer", () => {
  let addrFrom = Address.fromString("0xeb5bc717762e66b23395922cbed3e7a75434bf1c")
  let addrTo   = Address.fromString("0x77e33321514dec07aae86c6dfcefc54801ad19e0")

  let entity = new NftEntity("Aavegotchi-1")
  entity.currentOwner = addrFrom.toString()
  entity.platform = "Aavegotchi"
  entity.tokenId = BigInt.fromI32(1)
  entity.save()

  let newMockevent = newMockEvent();
  let event = new Transfer(
      newMockevent.address,
      newMockevent.logIndex,
      newMockevent.transactionLogIndex,
      newMockevent.logType,
      newMockevent.block,
      newMockevent.transaction,
      newMockevent.parameters
  );
  event.parameters = new Array<ethereum.EventParam>();

  let _from = new ethereum.EventParam("_from", ethereum.Value.fromAddress(addrFrom))
  event.parameters.push(_from);

  let _to = new ethereum.EventParam("_to",  ethereum.Value.fromAddress(addrTo));
  event.parameters.push(_to);

  let _id = new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(1))
  event.parameters.push(_id);

  event.transaction.to = newMockevent.address;
  event.transaction.from = newMockevent.address;

  handleAavegotchiTransfer(event)

  assert.fieldEquals("NftEntity", "Aavegotchi-1", "currentOwner", addrTo.toHex())

  assert.fieldEquals("Control", "orium-control", "lastNftTransferred", "Aavegotchi-1")

})
