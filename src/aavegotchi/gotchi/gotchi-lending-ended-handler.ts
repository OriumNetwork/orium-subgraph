import { log } from "@graphprotocol/graph-ts";
import { GotchiLendingEnded } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft, Rental } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { AAVEGOTCHI } from "../../utils/constants";

/**
 * event GotchiLendingEnded(
 *        uint32 indexed listingId,
 *        address indexed lender,
 *        address indexed borrower,
 *        uint32 tokenId,
 *        uint96 initialCost,
 *        uint32 period,
 *        uint8[3] revenueSplit,
 *        address originalOwner,
 *        address thirdParty,
 *        uint32 whitelistId,
 *        address[] revenueTokens,
 *        uint256 timeAgreed
 * );
 */
export function handleGotchiLendingEnded(event: GotchiLendingEnded): void {
  const nftId = generateNftId(AAVEGOTCHI, event.params.tokenId);

  const nft = Nft.load(nftId);
  if (!nft) {
    log.debug(
      "[handleGotchiLendingEnded] Aavegotchi {} does not exist, tx: {}",
      [event.params.tokenId.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  const currentRentalId = nft.currentRental;

  if (!currentRentalId) {
    throw new Error(
      "[handleGotchiLendingEnded] NFT " +
        nftId +
        " returned null for currentRental attribute, tx: " +
        event.transaction.hash.toHex()
    );
  }

  const currentRental = Rental.load(currentRentalId!);

  if (!currentRental) {
    throw new Error(
      "[handleGotchiLendingEnded] Rental " +
        currentRentalId! +
        " does not exist, tx: " +
        event.transaction.hash.toHex()
    );
  }

  // update rental
  currentRental.expiration_date = event.block.timestamp;
  currentRental.expiredTxHash = event.transaction.hash.toHex();
  currentRental.save();

  // remove current rental from nft, because it ended
  nft.currentRental = null;
  nft.save();
}
