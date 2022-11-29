import {
  assert,
  describe,
  test,
  clearStore,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import {
  handleTransfer,
  generateId,
} from "../../../src/aavegotchi/realm/realm-handler";
import { Transfer } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";

export function createNewEvent(from: string, to: string): Transfer {
  let event = changetype<Transfer>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();
  event.parameters.push(
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    )
  );
  event.parameters.push(
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(1))
  );
  return event;
}

describe("Aavegotchi Realm", () => {
  afterAll(() => {
    clearStore();
  });

  describe("Can handler transfer", () => {
    test("Should handle closed portal", () => {
      const from = "0x1111111111111111111111111111111111111111";
      const to = "0x2222222222222222222222222222222222222222";
      const event = createNewEvent(from, to);
      const _id = generateId(event);
      const previousOwner = from;
      const currentOwner = to;

      handleTransfer(event);

      assert.fieldEquals("Nft", _id, "previousOwner", previousOwner);
      assert.fieldEquals("Nft", _id, "currentOwner", currentOwner);
      assert.fieldEquals("Nft", _id, "state", "REALM");
      assert.fieldEquals("Nft", _id, "type", "REALM");
      assert.fieldEquals("Nft", _id, "tokenId", "1");
      assert.fieldEquals("Nft", _id, "platform", "Aavegotchi");
    });
  });
});