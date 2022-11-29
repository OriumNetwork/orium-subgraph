import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  ContractTransfer,
} from "../../../generated/schema";

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  // @ts-ignore
  let approvalEvent = changetype<Approval>(newMockEvent());

  approvalEvent.parameters = new Array();

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return approvalEvent;
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  // @ts-ignore
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent());

  approvalForAllEvent.parameters = new Array();

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  );

  return approvalForAllEvent;
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  // @ts-ignore
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  );

  ownershipTransferredEvent.parameters = new Array();

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  );
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  );

  return ownershipTransferredEvent;
}

export function createContractTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): ContractTransfer {
  // @ts-ignore
  let contractTransferEvent = changetype<ContractTransfer>(newMockEvent());

  contractTransferEvent.parameters = new Array();

  contractTransferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  contractTransferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  contractTransferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return contractTransferEvent;
}
