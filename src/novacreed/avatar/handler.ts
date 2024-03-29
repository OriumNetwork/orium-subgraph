import { Transfer } from "../../../generated/NovaAvatarBase/NovaAvatarBase";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "NOVAAVATAR";
const PLATFORM = "NovaAvatarBase";
const STATE = "AVATAR";

export function handleTransfer(event: Transfer): void {
  const from = event.params.from.toHex();
  const to = event.params.to.toHex();
  const tokenId = event.params.tokenId;

  new NftHandle(TYPE, STATE, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateId(event)
  );
}

export function generateId(event: Transfer): string {
  return TYPE + "-" + event.params.tokenId.toString();
}
