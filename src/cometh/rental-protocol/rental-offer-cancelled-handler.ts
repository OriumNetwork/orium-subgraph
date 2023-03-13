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

  for (let i = 0; i < rentalOffer.nfts.length; i++) {
    const nft = Nft.load(rentalOffer.nfts[i]);

    if (!nft) {
      throw new Error(
        "[handleRentalOfferCancelled] NFT " +
          rentalOffer.nfts[i] +
          " does not exist, tx: " +
          event.transaction.hash.toHex()
      );
    }

    updateNftCurrentRentalOffer(
      nft,
      rentalOffer,
      event.transaction.hash.toHex()
    );
  }
}

function updateNftCurrentRentalOffer(
  nft: Nft,
  rentalOffer: RentalOffer,
  txHash: string
): void {
  const currentRentalOfferId = nft.currentRentalOffer;

  if (!currentRentalOfferId) {
    log.warning(
      "[handleRentalOfferCancelled] NFT {} has no rental offer, tx: {}, skipping...",
      [nft.id, txHash]
    );
    return;
  }

  if (currentRentalOfferId != rentalOffer.id) {
    log.warning(
      "[handleRentalOfferCancelled] NFT {} has a different rental offer, actualOffer: {}, nft current offer: {}, tx: {}, skipping...",
      [nft.id, rentalOffer.id, currentRentalOfferId!, txHash]
    );
    return;
  }

  // remove current rental offer from nft, because it has been cancelled
  nft.currentRentalOffer = null;
  nft.save();

  log.warning(
    "[handleRentalOfferCancelled] Rental Offer for NFT {} was cancelled. RentalOfferId: {}. Tx: {}",
    [nft.id, currentRentalOfferId!, txHash]
  );
}
