import { Transfer } from "../../../generated/WTraveler/WChronosTraveler";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "WTRAVELER";
const PLATFORM = "Chronos";
const STATE = "WTRAVELER";

export function handleWTravelerTransfer(event: Transfer): void {
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
