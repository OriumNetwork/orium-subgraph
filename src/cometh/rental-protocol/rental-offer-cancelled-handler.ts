import { log } from "@graphprotocol/graph-ts";
import { Nft, RentalOffer } from "../../../generated/schema";
import { RentalOfferCancelled } from "../../../generated/ComethRentalProtocol/ComethRentalProtocol";

/**
 * event RentalOfferCancelled(
 *    uint256 indexed nonce,
 *    address indexed maker
 * );
 */
export function handleRentalOfferCancelled(event: RentalOfferCancelled): void {
  const rentalOffer = RentalOffer.load(
    `${event.transaction.from.toHexString()}-${event.params.nonce}`
  );

  if (!rentalOffer) {
    log.debug(
      "[handleRentalOfferCancelled] RentalOffer {} does not exist, tx: {}, skipping...",
      [event.params.nonce.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  // update rental offer
  rentalOffer.cancelledAt = event.block.timestamp;
  rentalOffer.cancellationTxHash = event.transaction.hash.toHex();
  rentalOffer.save();

  log.warning("[handleRentalOfferCancelled] RentalOffer {} cancelled, tx: {}", [
    rentalOffer.id,
    event.transaction.hash.toHex(),
  ]);

  const nft = Nft.load(rentalOffer.nft);

  if (!nft) {
    throw new Error(
      "[handleRentalOfferCancelled] NFT " +
        rentalOffer.nft +
        " does not exist, tx: " +
        event.transaction.hash.toHex()
    );
  }

  const currentRentalOfferId = nft.currentRentalOffer;

  if (!currentRentalOfferId) {
    log.warning(
      "[handleGotchiLendingCancelled] NFT {} has no rental offer, skipping...",
      [nft.id]
    );
    return;
  }

  if (currentRentalOfferId !== rentalOffer.id) {
    log.warning(
      "[handleGotchiLendingCancelled] NFT {} has a different rental offer, skipping...",
      [nft.id]
    );
    return;
  }

  // remove current rental offer from nft, because it has been cancelled
  nft.currentRentalOffer = null;
  nft.save();

  log.warning(
    "[handleGotchiLendingCancelled] Rental Offer for NFT {} was cancelled. RentalOfferId: {}",
    [nft.id, currentRentalOfferId!]
  );
}
