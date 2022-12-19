import {
  PortalOpened,
  Transfer,
} from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft } from "../../../generated/schema";
import { NftHandle } from "../../utils/nfthandle";

const TYPE = "AAVEGOTCHI";
const PLATFORM = "Aavegotchi";

export function handleTransfer(event: Transfer): void {
  const from = event.params._from.toHex();
  const to = event.params._to.toHex();
  const tokenId = event.params._tokenId;

  new NftHandle(TYPE, "CLOSED_PORTAL", PLATFORM).handle(
    event,
    from,
    to,
    tokenId,
    generateId(event.params._tokenId.toString())
  );
}

export function handlePortalOpened(event: PortalOpened): void {
  let id = "AAVEGOTCHI-" + event.params.tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = "OPENED_PORTAL";
    entity.save();
  }
}

export function generateId(tokenId: string): string {
  return TYPE + "-" + tokenId;
}
