import { Transfer } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft } from "../../../generated/schema";
import { AAVEGOTCHI } from "../../utils/constants";
import { generateNftId } from "../../utils/misc";
import { NftHandle } from "../../utils/nfthandle";
import { log } from "@graphprotocol/graph-ts";

const TYPE = "AAVEGOTCHI";
const PLATFORM = "Aavegotchi";

export function handleAavegotchiTransfer(event: Transfer): void {
  const tokenId = event.params._tokenId;

  const nftId = generateNftId(TYPE, tokenId);
  const gotchi = Nft.load(nftId);

  if (!gotchi) {
    log.info("Aavegotchi {} does not exist, skipping transfer...", [nftId]);
    return;
  }

  const from = event.params._from.toHex();
  const to = event.params._to.toHex();

  new NftHandle(TYPE, AAVEGOTCHI, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateNftId(TYPE, tokenId)
  );
}
