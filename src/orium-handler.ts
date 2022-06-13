import { BigInt } from "@graphprotocol/graph-ts"
import {
  Transfer,
  GotchiLendingExecute,
  GotchiLendingEnd
} from "../generated/Aavegotchi/Aavegotchi"
import { NftEntity, Address, Control } from "../generated/schema"

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

function addNftOwned(nftEntityId: string, addressId: string): void {
  let entity = Address.load(addressId)
  if (!entity) {
    entity = new Address(addressId)
    entity.nftsOwned = []
    entity.nftsLent = []
    entity.nftsBorrowed = []
  }
  entity.nftsOwned.push(nftEntityId)
  entity.save()
}

function addNftLent(nftEntityId: string, addressId: string): void {
  let entity = Address.load(addressId)
  if (!entity) {
    entity = new Address(addressId)
    entity.nftsOwned = []
    entity.nftsLent = []
    entity.nftsBorrowed = []
  }
  entity.nftsLent.push(nftEntityId)
  entity.save()
}

function addNftBorrowed(nftEntityId: string, addressId: string): void {
  let entity = Address.load(addressId)
  if (!entity) {
    entity = new Address(addressId)
    entity.nftsOwned = []
    entity.nftsLent = []
    entity.nftsBorrowed = []
  }
  entity.nftsBorrowed.push(nftEntityId)
  entity.save()
}

function removeNftOwned(nftEntityId: string, addressId: string): void {
  let entity = Address.load(addressId)
  if (!entity) {
    entity = new Address(addressId)
    entity.nftsOwned = []
    entity.nftsLent = []
    entity.nftsBorrowed = []
  }
  for (let i = 0; i < entity.nftsOwned.length; i++) {
    if (entity.nftsOwned[i] === nftEntityId) {
      entity.nftsOwned.splice(i, i+1)
      break
    }
  }
  entity.save()
}

function removeNftLent(nftEntityId: string, addressId: string): void {
  let entity = Address.load(addressId)
  if (!entity) {
    entity = new Address(addressId)
    entity.nftsOwned = []
    entity.nftsLent = []
    entity.nftsBorrowed = []
  }
  for (let i = 0; i < entity.nftsLent.length; i++) {
    if (entity.nftsLent[i] === nftEntityId) {
      entity.nftsLent.splice(i, i+1)
      break
    }
  }
  entity.save()
}

function removeNftBorrowed(nftEntityId: string, addressId: string): void {
  let entity = Address.load(addressId)
  if (!entity) {
    entity = new Address(addressId)
    entity.nftsOwned = []
    entity.nftsLent = []
    entity.nftsBorrowed = []
  }
  for (let i = 0; i < entity.nftsBorrowed.length; i++) {
    if (entity.nftsBorrowed[i] === nftEntityId) {
      entity.nftsBorrowed.splice(i, i+1)
      break
    }
  }
  entity.save()
}

function handleTransfer(event: Transfer, platform: string): void {
  let id = platform + "-" + event.params.tokenId.toString()
  let entity = NftEntity.load(id)
  if (!entity) {
    entity = new NftEntity(id)
  }
  if (entity.currentOwner !== event.params.to.toHex()) {
    entity.currentOwner = event.params.to.toHex()
    entity.previousOwner = event.params.from.toHex()
    entity.platform = platform
    entity.tokenId = event.params.tokenId
    entity.save()

    addNftOwned(entity.id, event.params.to.toHex())
    removeNftOwned(entity.id, event.params.from.toHex())
  } else {
    // This is probably a GotchiLendingEnd and ownership of tokenId
    // is already at the "to" address.
  }

  let control = Control.load('orium-control')
  if (!control) {
    control = new Control('orium-control')
  }
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
  let control = Control.load('orium-control')
  if (!control) {
    control = new Control('orium-control')
  }
  let nftEntity = NftEntity.load(control.lastNftTransferred)
  if (nftEntity) {
    addNftLent(nftEntity.id, nftEntity.previousOwner)
    addNftBorrowed(nftEntity.id, nftEntity.currentOwner)
    removeNftOwned(nftEntity.id, nftEntity.currentOwner)
    addNftOwned(nftEntity.id, nftEntity.previousOwner)
    restoreCurrentOwner(nftEntity.id)
  }

}

export function handleGotchiLendingEnd(event: GotchiLendingEnd): void {
  let control = Control.load('orium-control')
  if (!control) {
    return
  }
  let nftEntity = NftEntity.load(control.lastNftTransferred)
  if (!nftEntity) {
    return
  }
  removeNftLent(control.lastNftTransferred, nftEntity.currentOwner)
  removeNftBorrowed(nftEntity.id, nftEntity.previousOwner)
}
