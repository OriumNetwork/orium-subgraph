import { Transfer } from "../../../generated/ComethSpaceship/ComethSpaceship";
import { NONE } from "../../utils/constants";
import { generateNftId } from "../../utils/misc";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "COMETHSPACESHIP";
const PLATFORM = "Cometh";

export function handleSpaceshipTransfer(event: Transfer): void {
  const tokenId = event.params.tokenId;
  const from = event.params.from.toHex();
  const to = event.params.to.toHex();

  new NftHandle(TYPE, NONE, PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateNftId(TYPE, tokenId)
  );
}
