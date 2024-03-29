import { log } from '@graphprotocol/graph-ts'
import { Account, Nft, Rental, RentalOffer } from '../../../generated/schema'
import { generateNftId, removeLastOfferExpirationAt } from '../../utils/misc'
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
      [nonce.toString(), tokenId.toString(), event.params.lender.toHexString(), txHash],
    )
    return
  }

  rentalOffer.executionTxHash = txHash
  rentalOffer.save()

  const nftId = generateNftId(COMETHSPACESHIP, tokenId)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.debug('[handleRentalStarted] Spaceship {} does not exist, tx: {}, skipping...', [tokenId.toString(), txHash])
    return
  }

  const previousRental = nft.currentRental
  if (previousRental) {
    throw new Error(
      '[handleRentalStarted] NFT ' + nftId + ' already has a rental ' + previousRental + ', tx: ' + txHash,
    )
  }

  let borrower = Account.load(event.params.tenant.toHexString())
  if (!borrower) {
    borrower = new Account(event.params.tenant.toHexString())
    borrower.save()
  }

  const currentRental = new Rental(`${event.transaction.hash.toHex()}-${event.logIndex.toString()}`)
  currentRental.nft = nftId
  currentRental.lender = event.params.lender.toHexString()
  currentRental.borrower = borrower.id
  currentRental.startedAt = event.block.timestamp
  currentRental.startedTxHash = txHash
  currentRental.rentalOffer = rentalOffer.id
  currentRental.expirationDate = event.params.end
  currentRental.beneficiaries = [currentRental.lender, currentRental.borrower]
  currentRental.save()

  nft.currentRental = currentRental.id
  // we remove the currentRentalOffer from the nft because we gonna prioritize the rental, even if there is other offers
  // in case others offers are still valid, they will be handled by the rental-offer-cancelled handler
  nft.currentRentalOffer = null
  nft.save()

  removeLastOfferExpirationAt(nftId, rentalOffer.expirationDate)

  log.warning('[handleRentalStarted] NFT {} has been rented, rentalId: {}, rentalOfferId: {}, tx: {}', [
    nftId,
    currentRental.id,
    rentalOffer.id,
    txHash,
  ])
}
