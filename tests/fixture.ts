import { generateNftId } from '../src/utils/misc'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Nft, Rental, RentalOffer } from '../generated/schema'
import { COMETHSPACESHIP, MAX_UINT256, ZERO_ADDRESS } from '../src/utils/constants'

export function arrayToString(stringArray: string[]): string {
  return '[' + stringArray.join(', ') + ']'
}

export function createMockGotchi(tokenId: string): Nft {
  const type = 'AAVEGOTCHI'
  const id = generateNftId(type, BigInt.fromString(tokenId))
  const aavegotchi = new Nft(id)
  aavegotchi.tokenId = BigInt.fromString(tokenId)
  aavegotchi.address = ZERO_ADDRESS
  aavegotchi.type = type
  aavegotchi.state = 'NONE'
  aavegotchi.platform = 'Aavegotchi'
  aavegotchi.currentOwner = ZERO_ADDRESS
  aavegotchi.previousOwner = ZERO_ADDRESS
  aavegotchi.originalOwner = ZERO_ADDRESS
  aavegotchi.save()
  return aavegotchi
}

export function createMockSpaceship(tokenId: string): Nft {
  const type = COMETHSPACESHIP
  const id = generateNftId(type, BigInt.fromString(tokenId))
  const spaceship = new Nft(id)
  spaceship.tokenId = BigInt.fromString(tokenId)
  spaceship.address = ZERO_ADDRESS
  spaceship.type = type
  spaceship.state = 'NONE'
  spaceship.platform = 'Aavegotchi'
  spaceship.currentOwner = ZERO_ADDRESS
  spaceship.previousOwner = ZERO_ADDRESS
  spaceship.originalOwner = ZERO_ADDRESS
  spaceship.save()
  return spaceship
}

export function buildEventParamUintArray(name: string, value: string[]): ethereum.EventParam {
  const ethValue = ethereum.Value.fromUnsignedBigIntArray(
    value.map<BigInt>((v) => BigInt.fromString(v))
  )
  return new ethereum.EventParam(name, ethValue)
}

export function buildEventParamUint(name: string, value: string): ethereum.EventParam {
  const ethValue = ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value))
  return new ethereum.EventParam(name, ethValue)
}

export function buildEventParamAddressArray(name: string, value: string[]): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromAddressArray(
    value.map<Address>((v) => Address.fromString(v))
  )
  return new ethereum.EventParam(name, ethAddress)
}

export function buildEventParamAddress(name: string, address: string): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromAddress(Address.fromString(address))
  return new ethereum.EventParam(name, ethAddress)
}

export function createMockRentalOffer(
  tokenId: string,
  lender: string,
  feeToken: string,
  initialCost: string,
  duration: string,
  revenueSplit: string[],
  revenueTokens: string[],
  timeCreated: string,
  creationTxHash: string = '0x0000000'
): RentalOffer {
  const rentalOffer = new RentalOffer(tokenId)
  rentalOffer.nfts = [tokenId]
  rentalOffer.lender = lender
  rentalOffer.feeToken = feeToken
  rentalOffer.feeAmount = BigInt.fromString(initialCost)
  rentalOffer.duration = [BigInt.fromString(duration)]
  rentalOffer.profitShareSplit = revenueSplit.map<BigInt>((split) => BigInt.fromString(split))
  rentalOffer.profitShareTokens = revenueTokens
  rentalOffer.createdAt = BigInt.fromString(timeCreated)
  rentalOffer.creationTxHash = creationTxHash
  rentalOffer.expirationDate = MAX_UINT256
  rentalOffer.save()

  return rentalOffer
}

export function createMockRental(
  id: string,
  nft: string,
  borrower: string,
  lender: string,
  startedAt: string,
  startedTxHash: string,
  expirationDate: string | null = null,
  endedTxHash: string | null = null,
  rentalOffer: string | null = null
): Rental {
  const rental = new Rental(id)
  rental.nft = nft
  rental.borrower = borrower
  rental.lender = lender
  rental.startedAt = BigInt.fromString(startedAt)
  rental.startedTxHash = startedTxHash
  rental.expirationDate = expirationDate ? BigInt.fromString(expirationDate) : null
  rental.endedTxHash = endedTxHash || null
  rental.rentalOffer = rentalOffer || null
  rental.save()

  return rental
}
