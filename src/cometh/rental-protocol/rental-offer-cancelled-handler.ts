import { log } from '@graphprotocol/graph-ts'
import { RentalOffer } from '../../../generated/schema'
import { RentalOfferCancelled } from '../../../generated/ComethRentalProtocol/ComethRentalProtocol'
import { removeLastOfferExpirationAt } from '../../utils/misc'

/**
 * event RentalOfferCancelled(
 *    uint256 indexed nonce,
 *    address indexed maker
 * );
 */
export function handleRentalOfferCancelled(event: RentalOfferCancelled): void {
  const rentalOffer = RentalOffer.load(`${event.transaction.from.toHexString()}-${event.params.nonce}`)

  if (!rentalOffer) {
    log.debug('[handleRentalOfferCancelled] RentalOffer {} does not exist, tx: {}, skipping...', [
      event.params.nonce.toString(),
      event.transaction.hash.toHex(),
    ])
    return
  }

  // update rental offer
  rentalOffer.cancelledAt = event.block.timestamp
  rentalOffer.cancellationTxHash = event.transaction.hash.toHex()
  rentalOffer.save()
  
  // Remove nfts lastOfferExpirationAt
  // To be used exclusively for the orium scholarships protocol
  for(let i = 0; i < rentalOffer.nfts.length; i++) {
    removeLastOfferExpirationAt(rentalOffer.nfts[i], rentalOffer.expirationDate)
  }

  log.warning('[handleRentalOfferCancelled] RentalOffer {} cancelled, tx: {}', [
    rentalOffer.id,
    event.transaction.hash.toHex(),
  ])
}
