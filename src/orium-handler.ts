import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  AavegotchiDiamond,
  Transfer,
  PortalOpened,
  ClaimAavegotchi,
} from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Hatched } from "../generated/FancyBabyBirdsBreedingService/FancyBabyBirdsBreedingService";

import {
  Nft,
  Rental,
  Account,
  ClaimedToken,
  Control,
} from "../generated/schema";
import {
  AavegotchiState,
  AavegotchiTypes,
  AAVEGOTCHI_PREFIX,
  FANCYBABYBIRD_PREFIX,
  FancyBirdsState,
  FancyBirdsTypes,
  Platform,
} from "./utils/constants";

export function handleFancyBirdsTransfer(event: Transfer): void {
  handleTransfer(
    event,
    Platform.FancyBirds,
    FancyBirdsTypes.FANCYBIRD,
    FancyBirdsState.BIRD
  );
}

export function handleFancyBabyBirdsTransfer(event: Transfer): void {
  handleTransfer(
    event,
    Platform.FancyBirds,
    FancyBirdsTypes.FANCYBABYBIRD,
    FancyBirdsState.EGG
  );
}

export function handleFancyBabyBirdsHatched(event: Hatched): void {
  let id = FANCYBABYBIRD_PREFIX + event.params.tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = FancyBirdsState.BIRD;
    entity.save();
  }
}

/*
export function handlePegaTransfer(event: Transfer): void {
  handleTransfer(event, "Pega", "Pega")
}

export function handleThetanArenaTransfer(event: Transfer): void {
  handleTransfer(event, "ThetanArena", "ThetanArena")
}
*/

export function handleAavegotchiTransfer(event: Transfer): void {
  handleTransfer(
    event,
    Platform.Aavegotchi,
    AavegotchiTypes.AAVEGOTCHI,
    AavegotchiState.CLOSED_PORTAL
  );
}

export function handleRealmTransfer(event: Transfer): void {
  handleTransfer(
    event,
    Platform.Aavegotchi,
    AavegotchiTypes.AAVEGOTCHI_LAND,
    AavegotchiState.AAVEGOTCHI_LAND
  );
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
    entity.tokenId = event.params._tokenId;
  }

  let toAccount = Account.load(event.params._to.toHex());
  if (!toAccount) {
    toAccount = new Account(event.params._to.toHex());
    toAccount.save();
  }

  let fromAccount = Account.load(event.params._from.toHex());
  if (!fromAccount) {
    fromAccount = new Account(event.params._from.toHex());
    fromAccount.save();
  }

  entity.currentOwner = toAccount.id;
  entity.previousOwner = fromAccount.id;
  entity.originalOwner = toAccount.id;
  entity.save();
}

function loadAndSaveRental(nftEntity: Nft, listingId: BigInt): void {
  let id = nftEntity.id + "-" + listingId.toString();
  let entity = Rental.load(id);
  if (!entity) {
    entity = new Rental(id);
  }
  entity.nftEntity = nftEntity.id;
  entity.lender = nftEntity.previousOwner;
  entity.borrower = nftEntity.currentOwner;
  entity.save();
}

function handleTransfer(
  event: Transfer,
  platform: string,
  type: string,
  state: string
): void {
  let id = type + "-" + event.params._tokenId.toString();
  loadAndSaveNft(
    id,
    event,
    platform,
    type,
    state,
    event.address.toHexString().toLowerCase()
  );
}

function getOrCreateRental(
  listingId: BigInt,
  lender: string,
  borrower: string | null,
  thirdParty: string,
  tokenId: BigInt,
  initialCost: BigInt,
  period: BigInt,
  revenueSplit: i32[]
): Rental {
  let rental = Rental.load(listingId.toString());
  if (!rental) {
    rental = new Rental(listingId.toString());
    rental.nftEntity = AAVEGOTCHI_PREFIX + tokenId.toString();
    rental.lender = lender;
    rental.borrower = borrower;
    rental.thirdParty = thirdParty;
    rental.tokenId = tokenId;
    rental.initialCost = initialCost;
    rental.period = period;
    rental.revenueSplit = revenueSplit;
    rental.canceled = false;
    rental.completed = false;
  }
  if (borrower != null && rental.borrower == null) {
    rental.borrower = borrower;
  }

  return rental;
}

function getOrCreateClaimedToken(
  tokenAddress: Bytes,
  rental: Rental
): ClaimedToken {
  let id = tokenAddress.toHexString() + "-" + rental.id;
  let token = ClaimedToken.load(id);
  if (token == null) {
    token = new ClaimedToken(id);
    token.rental = rental.id;
    token.token = tokenAddress.toHex();
    token.amount = BigInt.fromI32(0);
  }
  return token;
}

export function handlePortalOpened(event: PortalOpened): void {
  let id = AAVEGOTCHI_PREFIX + event.params.tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = AavegotchiState.OPENED_PORTAL;
    entity.save();
  }
}

export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  let id = AAVEGOTCHI_PREFIX + event.params._tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = AavegotchiState.AAVEGOTCHI;
    entity.save();
  }
}
