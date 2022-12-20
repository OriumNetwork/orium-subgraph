import { Transfer } from "../../../generated/Traveler/ChronosTraveler";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "TRAVELER";
const PLATFORM = "Chronos";
const STATE = "TRAVELER";

export function handleTravelerTransfer(event: Transfer): void {
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
