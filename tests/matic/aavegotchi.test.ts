import {
  test,
  describe,
  beforeAll,
  assert,
  clearStore,
  newMockEvent,
  createMockedFunction,
} from "matchstick-as/assembly/index";
import { Nft, ClaimedToken } from "../../generated/schema";
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
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";

import {
  handleRealmTransfer,
  handleAavegotchiTransfer,
  handlePortalOpened,
  handleClaimAavegotchi,
} from "../../src/orium-handler";

const GOTCHI_ADDRESS = "0x86935F11C86623deC8a25696E1C19a8659CbF95d";

beforeAll(() => {
  let entity = new Nft("AAVEGOTCHI-123");
  entity.currentOwner = "0x1111111111111111111111111111111111111111";
  entity.previousOwner = "0x0000000000000000000000000000000000000000";
  entity.originalOwner = "0x1111111111111111111111111111111111111111";
  entity.platform = "Aavegotchi";
  entity.state = "PORTAL";
  entity.type = "AAVEGOTCHI";
  entity.tokenId = BigInt.fromI32(123);
  entity.address = GOTCHI_ADDRESS.toLowerCase();
  entity.save();
});

describe("Transfer events", () => {
  test("Transfer existent token", () => {
    // @ts-ignore
    let event = changetype<Transfer>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x1111111111111111111111111111111111111111")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x2222222222222222222222222222222222222222")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(123))
    );

    handleAavegotchiTransfer(event);

    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-123",
      "currentOwner",
      "0x2222222222222222222222222222222222222222"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-123",
      "previousOwner",
      "0x1111111111111111111111111111111111111111"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-123",
      "originalOwner",
      "0x2222222222222222222222222222222222222222"
    );
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "PORTAL");
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "type", "AAVEGOTCHI");
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "tokenId", "123");
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "platform", "Aavegotchi");
  });

  test("Transfer NON-existent token", () => {
    // @ts-ignore
    let event = changetype<Transfer>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();

    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x1111111111111111111111111111111111111111")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x2222222222222222222222222222222222222222")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(333))
    );

    handleAavegotchiTransfer(event);

    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-333",
      "currentOwner",
      "0x2222222222222222222222222222222222222222"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-333",
      "previousOwner",
      "0x1111111111111111111111111111111111111111"
    );
  });

  test("Many transfers in a row", () => {
    // @ts-ignore
    let event = changetype<Transfer>(newMockEvent());

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x1111111111111111111111111111111111111111")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x2222222222222222222222222222222222222222")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(333))
    );

    handleAavegotchiTransfer(event);

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x2222222222222222222222222222222222222222")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x3333333333333333333333333333333333333333")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(333))
    );

    handleAavegotchiTransfer(event);

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x3333333333333333333333333333333333333333")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x4444444444444444444444444444444444444444")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(333))
    );

    handleAavegotchiTransfer(event);

    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-333",
      "currentOwner",
      "0x4444444444444444444444444444444444444444"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-333",
      "previousOwner",
      "0x3333333333333333333333333333333333333333"
    );
  });

  test("Testing 30 transfers to a unique owner", () => {
    // @ts-ignore
    let event = changetype<Transfer>(newMockEvent());

    for (let i = 0; i < 30; i++) {
      event.parameters = new Array<ethereum.EventParam>();

      event.parameters.push(
        new ethereum.EventParam(
          "_from",
          ethereum.Value.fromAddress(
            Address.fromString("0x2222222222222222222222222222222222222222")
          )
        )
      );
      event.parameters.push(
        new ethereum.EventParam(
          "_to",
          ethereum.Value.fromAddress(
            Address.fromString("0x3333333333333333333333333333333333333333")
          )
        )
      );
      event.parameters.push(
        new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(100 + i))
      );

      handleAavegotchiTransfer(event);
    }

    for (let i = 0; i < 30; i++) {
      assert.fieldEquals(
        "Nft",
        "AAVEGOTCHI-" + (100 + i).toString(),
        "currentOwner",
        "0x3333333333333333333333333333333333333333"
      );
      assert.fieldEquals(
        "Nft",
        "AAVEGOTCHI-" + (100 + i).toString(),
        "previousOwner",
        "0x2222222222222222222222222222222222222222"
      );
    }
  });

  test("Testing mixed platform transfers", () => {
    // @ts-ignore
    let event = changetype<Transfer>(newMockEvent());

    for (let i = 0; i < 30; i++) {
      event.parameters = new Array<ethereum.EventParam>();

      event.parameters.push(
        new ethereum.EventParam(
          "_from",
          ethereum.Value.fromAddress(
            Address.fromString("0x2222222222222222222222222222222222222222")
          )
        )
      );
      event.parameters.push(
        new ethereum.EventParam(
          "_to",
          ethereum.Value.fromAddress(
            Address.fromString("0x3333333333333333333333333333333333333333")
          )
        )
      );
      event.parameters.push(
        new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(100 + i))
      );

      handleAavegotchiTransfer(event);
    }

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x0000000000000000000000000000000000000000")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x1111111111111111111111111111111111111111")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(110))
    );

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x0000000000000000000000000000000000000000")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x4444444444444444444444444444444444444444")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(120))
    );

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x0000000000000000000000000000000000000000")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x5555555555555555555555555555555555555555")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(115))
    );

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x0000000000000000000000000000000000000000")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x6666666666666666666666666666666666666666")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(115))
    );
    handleRealmTransfer(event);

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x0000000000000000000000000000000000000000")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x7777777777777777777777777777777777777777")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(120))
    );
    handleRealmTransfer(event);

    for (let i = 0; i < 30; i++) {
      assert.fieldEquals(
        "Nft",
        "AAVEGOTCHI-" + (100 + i).toString(),
        "currentOwner",
        "0x3333333333333333333333333333333333333333"
      );
      assert.fieldEquals(
        "Nft",
        "AAVEGOTCHI-" + (100 + i).toString(),
        "previousOwner",
        "0x2222222222222222222222222222222222222222"
      );
    }

    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI_LAND-115",
      "currentOwner",
      "0x6666666666666666666666666666666666666666"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI_LAND-115",
      "previousOwner",
      "0x0000000000000000000000000000000000000000"
    );

    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI_LAND-120",
      "currentOwner",
      "0x7777777777777777777777777777777777777777"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI_LAND-120",
      "previousOwner",
      "0x0000000000000000000000000000000000000000"
    );
  });
});

describe("Change Aavegotchi STATE events", () => {
  test("Testing PortalOpened", () => {
    // @ts-ignore
    let event = changetype<PortalOpened>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam("tokenId", ethereum.Value.fromI32(123))
    );
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "PORTAL");
    handlePortalOpened(event);
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "OPENED_PORTAL");
  });

  test("Testing transfer after PortalOpened", () => {
    // @ts-ignore
    let event = changetype<Transfer>(newMockEvent());

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x1111111111111111111111111111111111111111")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x2222222222222222222222222222222222222222")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(123))
    );

    handleAavegotchiTransfer(event);

    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-123",
      "currentOwner",
      "0x2222222222222222222222222222222222222222"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-123",
      "previousOwner",
      "0x1111111111111111111111111111111111111111"
    );
  });

  test("Testing ClaimAavegotchi", () => {
    // @ts-ignore
    let event = changetype<ClaimAavegotchi>(newMockEvent());
    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(123))
    );
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "OPENED_PORTAL");
    handleClaimAavegotchi(event);
    assert.fieldEquals("Nft", "AAVEGOTCHI-123", "state", "AAVEGOTCHI");
  });

  test("Testing transfer after ClaimAavegotchi", () => {
    // @ts-ignore
    let event = changetype<Transfer>(newMockEvent());

    event.parameters = new Array<ethereum.EventParam>();
    event.parameters.push(
      new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(
          Address.fromString("0x2222222222222222222222222222222222222222")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(
          Address.fromString("0x3333333333333333333333333333333333333333")
        )
      )
    );
    event.parameters.push(
      new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(123))
    );

    handleAavegotchiTransfer(event);

    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-123",
      "currentOwner",
      "0x3333333333333333333333333333333333333333"
    );
    assert.fieldEquals(
      "Nft",
      "AAVEGOTCHI-123",
      "previousOwner",
      "0x2222222222222222222222222222222222222222"
    );
  });
});
