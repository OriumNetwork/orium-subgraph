import { ClaimAavegotchi } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft } from "../../../generated/schema";
import { AAVEGOTCHI, ZERO_ADDRESS } from "../../utils/constants";
import { generateNftId } from "../../utils/misc";

const PLATFORM = "Aavegotchi";
export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  const tokenId = event.params._tokenId;

  let nftId = generateNftId(AAVEGOTCHI, tokenId);
  let entity = Nft.load(nftId);

  if (!entity) {
    const owner = event.transaction.from.toHexString();

    entity = new Nft(nftId);
    entity.type = AAVEGOTCHI;
    entity.platform = PLATFORM;
    entity.tokenId = tokenId;
    entity.address = event.address.toHexString();
    entity.currentOwner = owner;
    entity.originalOwner = owner;
    entity.previousOwner = ZERO_ADDRESS;
  }

  entity.state = AAVEGOTCHI;
  entity.save();
}
