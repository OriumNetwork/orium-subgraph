import { log } from '@graphprotocol/graph-ts'
import { Nft, Rental, RentalOffer } from '../../../generated/schema'
import { generateNftId } from '../../utils/misc'
import { COMETHSPACESHIP } from '../../utils/constants'
import { RentalStarted } from '../../../generated/ComethRentalProtocol/ComethRentalProtocol'
import { SPACESHIP_ADDRESS } from '../../utils/addresses'

/**
 *     event RentalStarted(
 *        uint256 indexed nonce,
 *        address indexed lender,
 *        address indexed tenant,
 *        address token,
 *        uint256 tokenId,
 *        uint64 duration,
 *        uint16 basisPoints,
 *        uint256 start,
 *        uint256 end
 *    );
 */

export function handleRentalStarted(event: RentalStarted): void {
  const tokenId = event.params.tokenId
  const txHash = event.transaction.hash.toHex()
  if (event.params.token.toHexString() != SPACESHIP_ADDRESS) {
    log.debug('[handleRentalStarted] NFT {} is not a spaceship, tx: {}, skipping...', [tokenId.toString(), txHash])
    return
  }

  const nonce = event.params.nonce
  const rentalOfferId = `${event.params.lender.toHexString()}-${nonce}`
  const rentalOffer = RentalOffer.load(rentalOfferId)

  if (!rentalOffer) {
    log.warning(
      '[handleRentalStarted] No rental offer with nonce {} was found for token id: {}, lender: {}, tx: {}, skipping...',
      [nonce.toString(), tokenId.toString(), event.params.lender.toHexString(), txHash]
    )
    return
  }

  const nftId = generateNftId(COMETHSPACESHIP, tokenId)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.debug('[handleRentalStarted] Spaceship {} does not exist, tx: {}, skipping...', [tokenId.toString(), txHash])
    return
  }

  const previousRental = nft.currentRental
  if (previousRental) {
    throw new Error(
      '[handleRentalStarted] NFT ' + nftId + ' already has a rental ' + previousRental + ', tx: ' + txHash
    )
  }

  const currentRental = new Rental(`${event.transaction.hash.toHex()}-${event.logIndex.toString()}`)
  currentRental.nft = nftId
  currentRental.lender = event.params.lender.toHexString()
  currentRental.borrower = event.params.tenant.toHexString()
  currentRental.startDate = event.block.timestamp
  currentRental.startedTxHash = txHash
  currentRental.rentalOffer = rentalOffer.id
  currentRental.expirationDate = event.params.end
  currentRental.save()

  // no need to remove current rental offer from nft, because currentRentalOffer will only track the last one created.
  nft.currentRental = currentRental.id
  nft.save()

  log.warning('[handleRentalStarted] NFT {} has been rented, rentalId: {}, rentalOfferId: {}, tx: {}', [
    nftId,
    currentRental.id,
    rentalOffer.id,
    txHash,
  ])
}
