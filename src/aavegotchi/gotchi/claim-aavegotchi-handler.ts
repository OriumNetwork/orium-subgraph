import { ClaimAavegotchi } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Account, Nft } from "../../../generated/schema";
import { AAVEGOTCHI, ZERO_ADDRESS } from "../../utils/constants";
import { generateNftId } from "../../utils/misc";

const PLATFORM = "Aavegotchi";
export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  const owner = event.transaction.from.toHexString();

  let ownerAccount = Account.load(owner);
  if (!ownerAccount) {
    ownerAccount = new Account(owner);
    ownerAccount.save();
  }

  let zeroAddressAccount = Account.load(ZERO_ADDRESS);
  if (!zeroAddressAccount) {
    zeroAddressAccount = new Account(ZERO_ADDRESS);
    zeroAddressAccount.save();
  }

  const tokenId = event.params._tokenId;
  let nftId = generateNftId(AAVEGOTCHI, tokenId);
  let entity = Nft.load(nftId);

  if (!entity) {
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
