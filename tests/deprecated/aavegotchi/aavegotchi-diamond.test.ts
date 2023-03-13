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
});
