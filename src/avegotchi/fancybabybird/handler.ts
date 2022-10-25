import { Transfer } from "../../../generated/FancyBabyBirds/FancyBabyBirds";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "FANCYBABYBIRD";
const PLATFORM = "FancyBabyBirds";
const STATE = "FBB";

export function handleFancyBirdsTransfer(event: Transfer): void {
  const from = event.params.from.toHex();
  const to = event.params.to.toHex();
  const tokenId = event.params.tokenId;

  new NftHandle(TYPE, STATE, PLATFORM).handle(
    from,
    to,
    tokenId,
    generateId(event)
  );
}

export function generateId(event: Transfer): string {
  return TYPE + "-" + event.params.tokenId.toString();
}
