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
  handlePortalOpened,
} from "../../../src/aavegotchi/diamond/diamond-handler";
import {
  PortalOpened,
  Transfer,
} from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";

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
      const _id = generateId(event.params._tokenId.toString());
      const previousOwner = from;
      const currentOwner = to;

      handleTransfer(event);

      assert.fieldEquals("Nft", _id, "previousOwner", previousOwner);
      assert.fieldEquals("Nft", _id, "currentOwner", currentOwner);
      assert.fieldEquals("Nft", _id, "state", "CLOSED_PORTAL");
      assert.fieldEquals("Nft", _id, "type", "AAVEGOTCHI");
      assert.fieldEquals("Nft", _id, "tokenId", "1");
      assert.fieldEquals("Nft", _id, "platform", "Aavegotchi");
    });

    test("Should handle OPENED_PORTAL  (PortalOpened)", () => {
      const tokenId = 1;
      const event = createNewPortalOpenedEvent(tokenId);
      const _id = generateId(tokenId.toString());
      const previousOwner = "0x1111111111111111111111111111111111111111";
      const currentOwner = "0x2222222222222222222222222222222222222222";

      handlePortalOpened(event);

      assert.fieldEquals("Nft", _id, "previousOwner", previousOwner);
      assert.fieldEquals("Nft", _id, "currentOwner", currentOwner);
      assert.fieldEquals("Nft", _id, "state", "OPENED_PORTAL");
      assert.fieldEquals("Nft", _id, "type", "AAVEGOTCHI");
      assert.fieldEquals("Nft", _id, "tokenId", "1");
      assert.fieldEquals("Nft", _id, "platform", "Aavegotchi");
    });
  });
});
