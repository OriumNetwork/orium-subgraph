import { Transfer } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "REALM";
const PLATFORM = "Aavegotchi";
const STATE = "REALM";

export function handleTransfer(event: Transfer): void {
  const from = event.params._from.toHex();
  const to = event.params._to.toHex();
  const tokenId = event.params._tokenId;

  new NftHandle(TYPE, STATE, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateId(event)
  );
}

export function generateId(event: Transfer): string {
  return TYPE + "-" + event.params._tokenId.toString();
}
