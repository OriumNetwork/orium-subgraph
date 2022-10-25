import {
  assert,
  describe,
  test,
  clearStore,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import {
  handleTransfer,
  generateId,
} from "../../../src/novacreed/spaceships/handler";
import { Transfer } from "../../../generated/Novaships/Novaships";

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

describe("Novaships", () => {
  afterAll(() => {
    clearStore();
  });

  test("Can handle Transfer", () => {
    const from = "0x1111111111111111111111111111111111111111";
    const to = "0x2222222222222222222222222222222222222222";
    const event = createNewEvent(from, to);
    const _id = generateId(event);

    handleTransfer(event);

    assert.fieldEquals(
      "Nft",
      _id,
      "previousOwner",
      "0x1111111111111111111111111111111111111111"
    );
    assert.fieldEquals(
      "Nft",
      _id,
      "currentOwner",
      "0x2222222222222222222222222222222222222222"
    );
    assert.fieldEquals("Nft", _id, "state", "SPACESHIP");
    assert.fieldEquals("Nft", _id, "type", "NOVASPACESHIP");
    assert.fieldEquals("Nft", _id, "tokenId", "1");
    assert.fieldEquals("Nft", _id, "platform", "Novaships");
  });
});
