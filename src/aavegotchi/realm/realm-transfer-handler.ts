import { Transfer } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { generateNftId } from "../../utils/misc";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "AAVEGOTCHI_LAND";
const PLATFORM = "Aavegotchi";
const STATE = "REALM";

export function handleRealmTransfer(event: Transfer): void {
  const from = event.params._from.toHex();
  const to = event.params._to.toHex();
  const tokenId = event.params._tokenId;

  new NftHandle(TYPE, STATE, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateNftId(TYPE, tokenId)
  );
}
