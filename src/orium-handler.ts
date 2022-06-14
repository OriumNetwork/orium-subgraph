import { BigInt } from "@graphprotocol/graph-ts"
import {
  Transfer,
  GotchiLendingExecute,
  GotchiLendingEnd
} from "../generated/Aavegotchi/Aavegotchi"
import { NftEntity, Rental, Address, Control } from "../generated/schema"

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
  }

  let toAddress = Address.load(event.params.to.toHex())
  if (!toAddress) {
    toAddress = new Address(event.params.to.toHex())
    toAddress.save()
  }

  let fromAddress = Address.load(event.params.from.toHex())
  if (!fromAddress) {
    fromAddress = new Address(event.params.from.toHex())
    fromAddress.save()
  }

  entity.currentOwner = toAddress.id
  entity.previousOwner = fromAddress.id
  entity.platform = platform
  entity.tokenId = event.params.tokenId
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

  let id = platform + "-" + event.params.tokenId.toString()
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

export function handleGotchiLendingExecute(event: GotchiLendingExecute): void {
  let control = loadControl('orium-control')
  let nftEntity = NftEntity.load(control.lastNftTransferred)
  if (nftEntity) {
    loadAndSaveRental(nftEntity, event.params.listingId)
    restoreCurrentOwner(nftEntity.id)
  }

}

export function handleGotchiLendingEnd(event: GotchiLendingEnd): void {
  let control = loadControl('orium-control')
  let nftEntity = NftEntity.load(control.lastNftTransferred)
  if (!nftEntity) {
    return
  }
  let lentEntity = Rental.load(nftEntity.id + "-" + event.params.listingId.toString())
  if (lentEntity) {
    lentEntity.borrower = "0x0000000000000000000000000000000000000000"
    lentEntity.lender   = "0x0000000000000000000000000000000000000000"
    lentEntity.save()
  }
}
