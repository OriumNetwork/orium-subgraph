import { log } from '@graphprotocol/graph-ts'
import { Nft, RentalOffer } from '../../../generated/schema'
import { RentalOfferCancelled } from '../../../generated/ComethRentalProtocol/ComethRentalProtocol'

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

  log.warning('[handleRentalOfferCancelled] RentalOffer {} cancelled, tx: {}', [
    rentalOffer.id,
    event.transaction.hash.toHex(),
  ])
}
