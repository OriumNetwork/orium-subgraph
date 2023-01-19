import { Transfer } from "../../../generated/WTraveler/WChronosTraveler";
import { generateNftId } from "../../utils/misc";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "WTRAVELER";
const PLATFORM = "CHRONOS";

export function handleWTravelerTransfer(event: Transfer): void {
  const from = event.params.from.toHex();
  const to = event.params.to.toHex();
  const tokenId = event.params.tokenId;

  new NftHandle(TYPE, null, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateNftId(TYPE, tokenId)
  );
}
