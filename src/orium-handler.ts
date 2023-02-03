import { Hatched } from "../generated/FancyBabyBirdsBreedingService/FancyBabyBirdsBreedingService";
import { Transfer } from "../generated/FancyBirds/FancyBirds";

import { Nft, Account } from "../generated/schema";
import {
  BIRD,
  EGG,
  FANCYBABYBIRD,
  FANCYBABYBIRD_PREFIX,
  FANCYBIRD,
  FancyBirds,
} from "./utils/constants";

export function handleFancyBirdsTransfer(event: Transfer): void {
  handleTransfer(event, FancyBirds, FANCYBIRD, BIRD);
}

export function handleFancyBabyBirdsTransfer(event: Transfer): void {
  handleTransfer(event, FancyBirds, FANCYBABYBIRD, EGG);
}

export function handleFancyBabyBirdsHatched(event: Hatched): void {
  let id = FANCYBABYBIRD_PREFIX + event.params.tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = BIRD;
    entity.save();
  }
}

function loadAndSaveNft(
  id: string,
  event: Transfer,
  platform: string,
  type: string,
  state: string,
  address: string
): void {
  let entity = Nft.load(id);
  if (!entity) {
    entity = new Nft(id);
    entity.type = type;
    entity.address = address;
    entity.state = state;
    entity.platform = platform;
    entity.tokenId = event.params.tokenId;
  }

  let toAccount = Account.load(event.params.to.toHex());
  if (!toAccount) {
    toAccount = new Account(event.params.to.toHex());
    toAccount.save();
  }

  let fromAccount = Account.load(event.params.from.toHex());
  if (!fromAccount) {
    fromAccount = new Account(event.params.from.toHex());
    fromAccount.save();
  }

  entity.currentOwner = toAccount.id;
  entity.previousOwner = fromAccount.id;
  entity.originalOwner = toAccount.id;
  entity.save();
}

function handleTransfer(
  event: Transfer,
  platform: string,
  type: string,
  state: string
): void {
  let id = type + "-" + event.params.tokenId.toString();
  loadAndSaveNft(
    id,
    event,
    platform,
    type,
    state,
    event.address.toHexString().toLowerCase()
  );
}
