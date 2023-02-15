import { log } from "@graphprotocol/graph-ts";
import { GotchiLendingExecuted } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft, Rental } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { AAVEGOTCHI } from "../../utils/constants";

/**
 * event GotchiLendingExecuted(
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
 *  );
 */
export function handleGotchiLendingExecuted(
  event: GotchiLendingExecuted
): void {
  const nftId = generateNftId(AAVEGOTCHI, event.params.tokenId);

  const nft = Nft.load(nftId);
  if (!nft) {
    log.debug(
      "[handlerCreateAavegotchiRentalOffer] Aavegotchi {} does not exist, tx: {}",
      [event.params.tokenId.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  const currentRentalOfferId = nft.currentRentalOffer;

  if (!currentRentalOfferId) {
    throw new Error(
      "[handlerCreateAavegotchiRentalOffer] NFT " +
        nftId +
        " returned null for currentRentalOffer attribute, tx: " +
        event.transaction.hash.toHex()
    );
  }

  const previoustRental = nft.currentRental;
  if (previoustRental) {
    throw new Error(
      "[handlerCreateAavegotchiRentalOffer] NFT " +
        nftId +
        " already has a rental " +
        previoustRental +
        ", tx: " +
        event.transaction.hash.toHex()
    );
  }

  const currentRental = new Rental(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`
  );
  currentRental.nft = nftId;
  currentRental.lender = event.params.lender.toHexString().toLowerCase();
  currentRental.borrower = event.params.borrower.toHexString().toLowerCase();
  currentRental.start_date = event.block.timestamp;
  currentRental.startedTxHash = event.transaction.hash.toHex();
  currentRental.rentalOffer = currentRentalOfferId;
  currentRental.save();

  // remove current rental offer from nft, because it has been executed, and link rental to nft
  nft.currentRentalOffer = null;
  nft.currentRental = currentRental.id;
  nft.save();
}
