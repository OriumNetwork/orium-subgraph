import { generateNftId } from "../src/utils/misc";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Nft } from "../generated/schema";
import { ZERO_ADDRESS } from "../src/utils/constants";

export function arrayToString(stringArray: string[]): string {
  return "[" + stringArray.join(", ") + "]";
}

export function createMockGotchi(tokenId: string): Nft {
  const type = "AAVEGOTCHI";
  const id = generateNftId(type, BigInt.fromString(tokenId));
  const aavegotchi = new Nft(id);
  aavegotchi.tokenId = BigInt.fromString(tokenId);
  aavegotchi.address = ZERO_ADDRESS;
  aavegotchi.type = type;
  aavegotchi.state = "NONE";
  aavegotchi.platform = "Aavegotchi";
  aavegotchi.currentOwner = ZERO_ADDRESS;
  aavegotchi.previousOwner = ZERO_ADDRESS;
  aavegotchi.originalOwner = ZERO_ADDRESS;
  aavegotchi.save();
  return aavegotchi;
}

export function buildEventParamUintArray(
  name: string,
  value: string[]
): ethereum.EventParam {
  const ethValue = ethereum.Value.fromUnsignedBigIntArray(
    value.map<BigInt>((v) => BigInt.fromString(v))
  );
  return new ethereum.EventParam(name, ethValue);
}

export function buildEventParamUint(
  name: string,
  value: string
): ethereum.EventParam {
  const ethValue = ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value));
  return new ethereum.EventParam(name, ethValue);
}

export function buildEventParamAddressArray(
  name: string,
  value: string[]
): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromAddressArray(
    value.map<Address>((v) => Address.fromString(v))
  );
  return new ethereum.EventParam(name, ethAddress);
}

export function buildEventParamAddress(
  name: string,
  address: string
): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromAddress(Address.fromString(address));
  return new ethereum.EventParam(name, ethAddress);
}
