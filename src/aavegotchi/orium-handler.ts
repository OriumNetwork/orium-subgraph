import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  AavegotchiDiamond,
  Transfer,
  GotchiLendingAdded,
  GotchiLendingExecuted,
  GotchiLendingCanceled,
  GotchiLendingClaimed,
  GotchiLendingEnded,
  PortalOpened,
  ClaimAavegotchi,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Account, ClaimedToken, Nft, Rental } from "../../generated/schema";
import {
  AAVEGOTCHI,
  Aavegotchi,
  AAVEGOTCHI_PREFIX,
  CLOSED_PORTAL,
  AAVEGOTCHI_LAND,
  OPENED_PORTAL,
} from "../utils/constants";

/*
export function handlePegaTransfer(event: Transfer): void {
  handleTransfer(event, "Pega", "Pega")
}

export function handleThetanArenaTransfer(event: Transfer): void {
  handleTransfer(event, "ThetanArena", "ThetanArena")
}
*/

export function handleAavegotchiTransfer(event: Transfer): void {
  handleTransfer(event, Aavegotchi, AAVEGOTCHI, CLOSED_PORTAL);
}

export function handleRealmTransfer(event: Transfer): void {
  handleTransfer(event, Aavegotchi, AAVEGOTCHI_LAND, AAVEGOTCHI_LAND);
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
  expirationDate: BigInt,
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
    rental.expirationDate = expirationDate;
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

export function handleGotchiLendingAdded(event: GotchiLendingAdded): void {
  let rental = getOrCreateRental(
    event.params.listingId,
    event.params.lender.toHex(),
    null,
    event.params.thirdParty.toHex(),
    event.params.tokenId,
    event.params.initialCost,
    event.params.period,
    event.params.revenueSplit
  );
  rental.timeCreated = event.params.timeCreated;
  rental.save();
}

export function handleGotchiLendingExecuted(
  event: GotchiLendingExecuted
): void {
  let rental = getOrCreateRental(
    event.params.listingId,
    event.params.lender.toHex(),
    event.params.borrower.toHex(),
    event.params.thirdParty.toHex(),
    event.params.tokenId,
    event.params.initialCost,
    event.params.period,
    event.params.revenueSplit
  );
  rental.timeAgreed = event.params.timeAgreed;
  rental.save();

  let nftEntity = Nft.load(rental.nftEntity);
  if (nftEntity) {
    nftEntity.originalOwner = event.params.lender.toHex();
    nftEntity.currentOwner = event.params.borrower.toHex();
    nftEntity.save();
  }
}

export function handleGotchiLendingCanceled(
  event: GotchiLendingCanceled
): void {
  let rental = getOrCreateRental(
    event.params.listingId,
    event.params.lender.toHex(),
    null,
    event.params.thirdParty.toHex(),
    event.params.tokenId,
    event.params.initialCost,
    event.params.period,
    event.params.revenueSplit
  );
  rental.canceled = true;
  rental.timeCanceled = event.params.timeCanceled;
  rental.save();
}

export function handleGotchiLendingClaimed(event: GotchiLendingClaimed): void {
  let rental = getOrCreateRental(
    event.params.listingId,
    event.params.lender.toHex(),
    event.params.borrower.toHex(),
    event.params.thirdParty.toHex(),
    event.params.tokenId,
    event.params.initialCost,
    event.params.period,
    event.params.revenueSplit
  );
  rental.timeClaimed = event.params.timeClaimed;

  for (let i = 0; i < event.params.revenueTokens.length; i++) {
    let token = getOrCreateClaimedToken(event.params.revenueTokens[i], rental);
    token.amount = token.amount.plus(event.params.amounts[i]);
    token.save();
  }
  rental.save();
}

export function handleGotchiLendingEnded(event: GotchiLendingEnded): void {
  let rental = getOrCreateRental(
    event.params.listingId,
    event.params.lender.toHex(),
    event.params.borrower.toHex(),
    event.params.thirdParty.toHex(),
    event.params.tokenId,
    event.params.initialCost,
    event.params.period,
    event.params.revenueSplit
  );
  rental.timeEnded = event.params.timeEnded;
  rental.completed = true;
  rental.save();
}

export function handlePortalOpened(event: PortalOpened): void {
  let id = AAVEGOTCHI_PREFIX + event.params.tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = OPENED_PORTAL;
    entity.save();
  }
}

export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  let id = AAVEGOTCHI_PREFIX + event.params._tokenId.toString();
  let entity = Nft.load(id);
  if (entity) {
    entity.state = AAVEGOTCHI;
    entity.save();
  }
}
