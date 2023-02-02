import { Transfer } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { CLOSED_PORTAL } from "../../utils/constants";
import { generateNftId } from "../../utils/misc";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "AAVEGOTCHI";
const PLATFORM = "Aavegotchi";

export function handleAavegotchiTransfer(event: Transfer): void {
  const from = event.params._from.toHex();
  const to = event.params._to.toHex();
  const tokenId = event.params._tokenId;

  new NftHandle(TYPE, CLOSED_PORTAL, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateNftId(TYPE, tokenId)
  );
}
