import {
  assert,
  describe,
  test,
  clearStore,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { handleAavegotchiTransfer } from "../../../src/aavegotchi/index";
import {
  PortalOpened,
  Transfer,
} from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { generateNftId } from "../../../src/utils/misc";

export function createNewTransferEvent(from: string, to: string): Transfer {
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

export function createNewPortalOpenedEvent(tokenId: number): PortalOpened {
  let event = changetype<PortalOpened>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();
  event.parameters.push(
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(1))
  );
  return event;
}

describe("Aavegotchi Diamond", () => {
  afterAll(() => {
    clearStore();
  });

  describe("Can handle States", () => {
    test("Should handle CLOSE_PORTAL (Transfer)", () => {
      const from = "0x1111111111111111111111111111111111111111";
      const to = "0x2222222222222222222222222222222222222222";
      const event = createNewTransferEvent(from, to);
      const _id = generateNftId("AAVEGOTCHI", event.params._tokenId);
      const previousOwner = from;
      const currentOwner = to;

      handleAavegotchiTransfer(event);

      assert.fieldEquals("Nft", _id, "previousOwner", previousOwner);
      assert.fieldEquals("Nft", _id, "currentOwner", currentOwner);
      assert.fieldEquals("Nft", _id, "state", "CLOSED_PORTAL");
      assert.fieldEquals("Nft", _id, "type", "AAVEGOTCHI");
      assert.fieldEquals("Nft", _id, "tokenId", "1");
      assert.fieldEquals("Nft", _id, "platform", "Aavegotchi");
    });
  });
});
