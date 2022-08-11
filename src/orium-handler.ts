import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AavegotchiDiamond,
  Transfer,
  GotchiLendingAdded,
  GotchiLendingExecuted,
  GotchiLendingCanceled,
  GotchiLendingClaimed,
  GotchiLendingEnded,
  PortalOpened,
  ClaimAavegotchi
} from "../generated/AavegotchiDiamond/AavegotchiDiamond"
import {
  Hatched
} from "../generated/FancyBabyBirdsBreedingService/FancyBabyBirdsBreedingService"

import { NftEntity, Rental, Holder, ClaimedToken, Control } from "../generated/schema"

export function handleFancyBirdsTransfer(event: Transfer): void {
  handleTransfer(event, "FancyBirds", "FANCYBIRD", "BIRD")
}

export function handleFancyBabyBirdsTransfer(event: Transfer): void {
  handleTransfer(event, "FancyBirds", "FANCYBABYBIRD", "EGG")
}

export function handleFancyBabyBirdsHatched(event: Hatched): void {
  let id = "FANCYBABYBIRD" + "-" + event.params.tokenId.toString()
  let entity = NftEntity.load(id)
  if (entity) {
    entity.state = "BIRD"
    entity.save()
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
  handleTransfer(event, "Aavegotchi", "AAVEGOTCHI", "PORTAL")
}

export function handleRealmTransfer(event: Transfer): void {
  handleTransfer(event, "Aavegotchi", "REALM", "REALM")
}

function loadAndSaveNftEntity(id: string, event: Transfer, platform: string, type: string, state: string): void {

  let entity = NftEntity.load(id)
  if (!entity) {
    entity = new NftEntity(id)
    entity.type = type
    entity.state = state
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

function handleTransfer(event: Transfer, platform: string, type: string, state: string): void {

  let id = type + "-" + event.params._tokenId.toString()
  loadAndSaveNftEntity(id, event, platform, type, state)

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
  let rental = Rental.load(listingId.toString())
  if (!rental) {
    rental = new Rental(listingId.toString())
    rental.lender = lender
    rental.borrower = borrower
    rental.thirdParty = thirdParty
    rental.tokenId = tokenId
    rental.initialCost = initialCost
    rental.period = period
    rental.revenueSplit = revenueSplit
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
  )
  rental.timeCreated = event.params.timeCreated
  rental.save()
}

export function handleGotchiLendingExecuted(event: GotchiLendingExecuted): void {
  let rental = getOrCreateRental(
    event.params.listingId,
    event.params.lender.toHex(),
    event.params.borrower.toHex(),
    event.params.thirdParty.toHex(),
    event.params.tokenId,
    event.params.initialCost,
    event.params.period,
    event.params.revenueSplit
  )
  rental.timeAgreed = event.params.timeAgreed

  let control = loadControl('orium-control')
  let nftEntity = NftEntity.load(control.lastNftTransferred)

  if (nftEntity) {
    restoreCurrentOwner(nftEntity.id)
  }

  rental.save()
}

export function handleGotchiLendingCanceled(event: GotchiLendingCanceled): void {
  let rental = getOrCreateRental(
    event.params.listingId,
    event.params.lender.toHex(),
    null,
    event.params.thirdParty.toHex(),
    event.params.tokenId,
    event.params.initialCost,
    event.params.period,
    event.params.revenueSplit
  )
  rental.cancelled = true
  rental.timeCanceled = event.params.timeCanceled
  rental.save()
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
  )
  rental.timeClaimed = event.params.timeClaimed

  for(let i=0; i < event.params.revenueTokens.length; i++) {
    let token = getOrCreateClaimedToken(event.params.revenueTokens[i], rental);
    token.amount = token.amount.plus(event.params.amounts[i]);
    token.save();
  }
  rental.save()
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
  )
  rental.timeEnded = event.params.timeEnded
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
