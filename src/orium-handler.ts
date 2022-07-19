import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AavegotchiDiamond,
  Transfer,
  GotchiLendingAdd,
  GotchiLendingExecute,
  GotchiLendingCancel,
  GotchiLendingClaim,
  GotchiLendingEnd,
  PortalOpened,
  ClaimAavegotchi
} from "../generated/AavegotchiDiamond/AavegotchiDiamond"

import { NftEntity, Rental, Holder, ClaimedToken, Control } from "../generated/schema"

export function handleFancyBirdsTransfer(event: Transfer): void {
  handleTransfer(event, "FancyBirds")
}

export function handleFancyBabyBirdsTransfer(event: Transfer): void {
  handleTransfer(event, "FancyBabyBirds")
}

export function handlePegaTransfer(event: Transfer): void {
  handleTransfer(event, "Pega")
}

export function handleAavegotchiTransfer(event: Transfer): void {
  handleTransfer(event, "Aavegotchi")
}

export function handleThetanArenaTransfer(event: Transfer): void {
  handleTransfer(event, "ThetanArena")
}

function loadAndSaveNftEntity(id: string, event: Transfer, platform: string): void {

  let entity = NftEntity.load(id)
  if (!entity) {
    entity = new NftEntity(id)
    entity.state = "PORTAL"
  }

  let toHolder = Holder.load(event.params._to.toHex())
  if (!toHolder) {
    toHolder = new Holder(event.params._to.toHex())
    toHolder.save()
  }

  let fromHolder = Holder.load(event.params._from.toHex())
  if (!fromHolder) {
    fromHolder = new Holder(event.params._from.toHex())
    fromHolder.save()
  }

  entity.currentOwner = toHolder.id
  entity.previousOwner = fromHolder.id
  entity.platform = platform
  entity.tokenId = event.params._tokenId
  entity.save()
}

function loadAndSaveRental(nftEntity: NftEntity, listingId: BigInt): void {
  let id = nftEntity.id + "-" + listingId.toString()
  let entity = Rental.load(id)
  if (!entity) {
    entity = new Rental(id)
  }
  entity.nftEntity = nftEntity.id
  entity.lender   = nftEntity.previousOwner
  entity.borrower = nftEntity.currentOwner
  entity.save()
}

function loadControl(id: String): Control {
  let control = Control.load('orium-control')
  if (!control) {
    control = new Control('orium-control')
  }
  return control
}

function handleTransfer(event: Transfer, platform: string): void {

  let id = platform + "-" + event.params._tokenId.toString()
  loadAndSaveNftEntity(id, event, platform)

  let control = loadControl('orium-control')
  control.lastNftTransferred = id
  control.save()
}

function restoreCurrentOwner(nftEntityId: string): void {
  let entity = NftEntity.load(nftEntityId)
  if (entity) {
    let currentOwner = entity.currentOwner
    entity.currentOwner = entity.previousOwner
    entity.previousOwner = currentOwner
    entity.save()
  }
}

function getOrCreateRental(listingId: BigInt): Rental {
  let rental = Rental.load(listingId.toString())
  if (!rental) {
    rental = new Rental(listingId.toString())
    rental.cancelled = false
    rental.completed = false
  }
  return rental
}

function getOrCreateClaimedToken(tokenAddress: Bytes, rental: Rental): ClaimedToken {
  let id = tokenAddress.toHexString() + "-" + rental.id
  let token = ClaimedToken.load(id)
  if(token == null) {
    token = new ClaimedToken(id)
    token.rental = rental.id
    token.token = tokenAddress.toHex()
    token.amount = BigInt.fromI32(0)
  }
  return token;
}

export function handleGotchiLendingAdd(event: GotchiLendingAdd): void {
  let rental = getOrCreateRental(event.params.listingId)
  /*
  let contract = AavegotchiDiamond.bind(event.address)
  let response = contract.try_getGotchiLendingListingInfo(event.params.listingId)
  rental.reverted = response.reverted ? true : false
  if (!response.reverted) {
    let listing = response.value.value0
    rental.nftEntity = "Aavegotchi-" + listing.erc721TokenId.toString()
    rental.lender = listing.lender.toHex()
    rental.thirdParty = listing.thirdParty.toHex()

    rental.period = listing.period
    rental.timeCreated = listing.timeCreated

    rental.upfrontCost = listing.initialCost
    rental.revenueSplit = listing.revenueSplit
  }
  */
  rental.save()
}

export function handleGotchiLendingExecute(event: GotchiLendingExecute): void {
  let rental = getOrCreateRental(event.params.listingId)

  let control = loadControl('orium-control')
  let nftEntity = NftEntity.load(control.lastNftTransferred)

  if (nftEntity) {
    rental.borrower = nftEntity.currentOwner
    rental.timeAgreed = event.block.timestamp
    restoreCurrentOwner(nftEntity.id)
  }

  rental.save()
}

export function handleGotchiLendingCancel(event: GotchiLendingCancel): void {
  let rental = getOrCreateRental(event.params.listingId)
  rental.cancelled = true
  rental.timeEnded = event.block.timestamp
  rental.save()
}

export function handleGotchiLendingClaim(event: GotchiLendingClaim): void {
  let rental = getOrCreateRental(event.params.listingId)
  rental.lastClaimed = event.block.timestamp
  for(let i=0; i < event.params.tokenAddresses.length; i++) {
    let token = getOrCreateClaimedToken(event.params.tokenAddresses[i], rental);
    token.amount = token.amount.plus(event.params.amounts[i]);
    token.save();
  }
  rental.save()
}

export function handleGotchiLendingEnd(event: GotchiLendingEnd): void {
  let rental = getOrCreateRental(event.params.listingId)
  rental.timeEnded = event.block.timestamp
  rental.completed = true
  rental.save()
}

export function handlePortalOpened(event: PortalOpened) : void {
  let id = "Aavegotchi-" + event.params.tokenId.toString()
  let entity = NftEntity.load(id)
  if (entity) {
    entity.state = "PORTAL_OPENED"
    entity.save()
  }
}

export function handleClaimAavegotchi(event: ClaimAavegotchi) : void {
  let id = "Aavegotchi-" + event.params._tokenId.toString()
  let entity = NftEntity.load(id)
  if (entity) {
    entity.state = "AAVEGOTCHI"
    entity.save()
  }
}
