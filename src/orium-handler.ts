import { BigInt } from "@graphprotocol/graph-ts"
import {
  FancyBirds,
  Transfer,
} from "../generated/FancyBirds/FancyBirds"
import { NftEntity } from "../generated/schema"

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

function handleTransfer(event: Transfer, platform: string): void {
  let id = platform + "-" + event.params.tokenId.toString()
  let entity = NftEntity.load(id)
  if (!entity) {
    entity = new NftEntity(id)
  }
  entity.currentOwner = event.params.to.toHex()
  entity.platform = platform
  entity.tokenId = event.params.tokenId
  entity.save()

}
