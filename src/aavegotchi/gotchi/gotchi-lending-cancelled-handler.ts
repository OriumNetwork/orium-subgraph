import { log } from "@graphprotocol/graph-ts";
import { GotchiLendingCanceled } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft, RentalOffer } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { AAVEGOTCHI } from "../../utils/constants";

/**
 * event GotchiLendingCancelled(
 *        uint32 indexed listingId,
 *        address indexed lender,
 *        uint32 tokenId,
 *        uint96 initialCost,
 *        uint32 period,
 *        uint8[3] revenueSplit,
 *        address originalOwner,
 *        address thirdParty,
 *        uint32 whitelistId,
 *        address[] revenueTokens,
 *        uint256 timeAgreed
 *  );
 */
export function handleGotchiLendingCancelled(
  event: GotchiLendingCanceled
): void {
  const nftId = generateNftId(AAVEGOTCHI, event.params.tokenId);

  const nft = Nft.load(nftId);
  if (!nft) {
    log.debug(
      "[handleGotchiLendingCancelled] Aavegotchi {} does not exist, tx: {}",
      [event.params.tokenId.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  const currentRentalOfferId = nft.currentRentalOffer;

  if (!currentRentalOfferId) {
    throw new Error(
      "[handleGotchiLendingCancelled] NFT " +
        nftId +
        " returned null for currentRentalOffer attribute, tx: " +
        event.transaction.hash.toHex()
    );
  }

  const currentRentalOffer = RentalOffer.load(currentRentalOfferId!);

  if (!currentRentalOffer) {
    throw new Error(
      "[handleGotchiLendingCancelled] RentalOffer " +
        currentRentalOfferId! +
        " does not exist, tx: " +
        event.transaction.hash.toHex()
    );
  }

  // update rental offer
  currentRentalOffer.cancelledAt = event.block.timestamp;
  currentRentalOffer.cancellationTxHash = event.transaction.hash.toHex();
  currentRentalOffer.save();

  // remove current rental offer from nft, because it has been executed, and link rental to nft
  nft.currentRentalOffer = null;
  nft.save();

  log.warning(
    "[handleGotchiLendingCancelled] Rental Offer for NFT {} was cancelled. RentalOfferId: {}",
    [nftId, currentRentalOfferId!]
  );
}
