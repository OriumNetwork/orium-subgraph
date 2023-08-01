import { BigInt, log } from "@graphprotocol/graph-ts";
import { GotchiLendingCancelled1 } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft, RentalOffer } from "../../../generated/schema";
import { generateNftId, removeLastOfferExpirationAt } from "../../utils/misc";
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
export function handleGotchiLendingCancelled2(
  event: GotchiLendingCancelled1
): void {
  const nftId = generateNftId(AAVEGOTCHI, event.params.param0.tokenId);

  const nft = Nft.load(nftId);
  if (!nft) {
    log.debug(
      "[handleGotchiLendingCancelled] Aavegotchi {} does not exist, tx: {}",
      [event.params.param0.tokenId.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  const currentRentalOfferId = nft.currentRentalOffer;

  if (!currentRentalOfferId) {
    //probably it is a legacy rental offer not tracked before rental upgrade
    log.warning(
      "[handleGotchiLendingCancelled] NFT {} has no rental offer, skipping...",
      [nft.id]
    );
    return;
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
  // Since aavegotchi only allows one offer at a time, we can set the expiration date to zero
  nft.lastOfferExpirationAt = BigInt.zero();
  nft.save();

  log.warning(
    "[handleGotchiLendingCancelled] Rental Offer for NFT {} was cancelled. RentalOfferId: {}",
    [nftId, currentRentalOfferId!]
  );
}
