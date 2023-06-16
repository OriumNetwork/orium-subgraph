import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { AavegotchiLand } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { NftHandle } from "../../utils/nfthandle";
import { AccessRight } from "../../utils/types";

const TYPE = "AAVEGOTCHI_LAND";
const PLATFORM = "Aavegotchi";
const STATE = "AAVEGOTCHI_LAND";

export function handleRealmTransfer(event: Transfer): void {
  const from = event.params._from.toHex();
  const to = event.params._to.toHex();
  const tokenId = event.params._tokenId;

  const nftId = generateNftId(TYPE, tokenId)

  let land = AavegotchiLand.load(nftId);

  if (!land) {
    land = new AavegotchiLand(nftId);
    land.nft = nftId;
    land.channelingAccessRight = BigInt.fromI32(AccessRight.ONLY_OWNER);
    land.emptyReservoirAccessRight = BigInt.fromI32(AccessRight.ONLY_OWNER);
    land.channelingWhitelist = BigInt.zero();
    land.emptyReservoirWhitelist = BigInt.zero();
    land.save();
  }

  new NftHandle(TYPE, STATE, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    nftId
  );
}
