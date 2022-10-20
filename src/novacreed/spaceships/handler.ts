import { Transfer } from "../../../generated/Novaships/Novaships";
import { NovaCreedNft } from "../utils/novacreednft";

const TYPE = "NOVASHIPS";
const PLATFORM = "Novaships";
const STATE = "NC";

export function handleTransfer(event: Transfer): void {
  const from = event.params.from.toHex();
  const to = event.params.to.toHex();
  const tokenId = event.params.tokenId;

  new NovaCreedNft(TYPE, STATE, PLATFORM).handle(
    from,
    to,
    tokenId,
    generateId(event)
  );
}

export function generateId(event: Transfer): string {
  return TYPE + "-" + event.params.tokenId.toString();
}
