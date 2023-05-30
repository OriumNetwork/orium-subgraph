import { BigInt } from '@graphprotocol/graph-ts'
import { RentalOffer } from '../../../generated/schema'
import { COMETHSPACESHIP, COMETH_RESOURCES, ZERO_ADDRESS } from '../../utils/constants'
import { RentalOfferCreated } from '../../../generated/ComethRentalProtocol/ComethRentalProtocol'
import { getComethProfitShareSplit, loadNfts, updateLastOfferExpirationAt } from '../../utils/misc'
import { log } from '@graphprotocol/graph-ts'
import { SPACESHIP_ADDRESS } from '../../utils/addresses'
/**
 *    event RentalOfferCreated(
 *       uint256 indexed nonce,
 *       address indexed maker,
 *       address taker,
 *       NFT[] nfts,
 *       address feeToken,
 *       uint256 feeAmount,
 *       uint256 deadline
 *   );
 */
export function handleRentalOfferCreated(event: RentalOfferCreated): void {
  // filter out nfts that are not spaceships
  const spaceshipsIds = event.params.nfts
    .filter((nft) => nft.token.toHexString() == SPACESHIP_ADDRESS)
    .map<BigInt>((nft) => nft.tokenId)

  if (!spaceshipsIds.length) {
    log.debug('[handleRentalOfferCreated] No spaceship nfts with valid address found in rental offer, tx: {}', [
      event.transaction.hash.toHex(),
    ])
    return
  }

  const foundNfts = loadNfts(spaceshipsIds, COMETHSPACESHIP)

  if (!foundNfts.length) {
    log.debug('[handleRentalOfferCreated] No valid spaceship nfts with valid id found in rental offer, tx: {}', [
      event.transaction.hash.toHex(),
    ])
    return
  }

  // Update with the highest expiration date from the offers
  // To be used exclusively for the orium scholarships protocol
  for (let i = 0; i < foundNfts.length; i++) {
    updateLastOfferExpirationAt(foundNfts[i], event.params.deadline)
  }

  // create rental offer
  const rentalOfferId = `${event.params.maker.toHexString()}-${event.params.nonce}`
  const rentalOffer = new RentalOffer(rentalOfferId)
  rentalOffer.nfts = foundNfts.map<string>((foundNfts) => foundNfts.id)
  rentalOffer.lender = event.params.maker.toHexString()
  rentalOffer.createdAt = event.block.timestamp
  rentalOffer.creationTxHash = event.transaction.hash.toHex()
  rentalOffer.duration = event.params.nfts.map<BigInt>((nft) => nft.duration)
  rentalOffer.feeAmount = event.params.feeAmount
  rentalOffer.feeToken = event.params.feeToken.toHexString()
  rentalOffer.profitShareSplit = getComethProfitShareSplit(BigInt.fromI32(event.params.nfts[0].basisPoints))
  rentalOffer.profitShareTokens = COMETH_RESOURCES
  rentalOffer.expirationDate = event.params.deadline

  if (event.params.taker.toHexString() != ZERO_ADDRESS) {
    rentalOffer.taker = event.params.taker.toHexString()
  }

  rentalOffer.save()

  log.warning('[handleRentalOfferCreated] RentalOffer {} created for NFTs {}, tx: {}', [
    rentalOfferId,
    rentalOffer.nfts.toString(),
    event.transaction.hash.toHex(),
  ])
}