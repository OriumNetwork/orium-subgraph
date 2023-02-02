import { ClaimAavegotchi } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft } from "../../../generated/schema";
import { AAVEGOTCHI, AAVEGOTCHI_PREFIX } from "../../utils/constants";

export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  let id = AAVEGOTCHI_PREFIX + event.params._tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = AAVEGOTCHI;
    entity.save();
  }
}
