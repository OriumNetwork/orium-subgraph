import { BigInt, log } from "@graphprotocol/graph-ts";
import { GotchiLendingAdded } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft, RentalOffer } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { GHST_TOKEN_ADDRESS } from "../../utils/addresses";
import { ONE_ETHER } from "../../utils/constants";

/**
 * event GotchiLendingAdded(
 *         uint32 indexed listingId,
 *         address indexed lender,
 *         uint32 indexed tokenId,
 *         uint96 initialCost,
 *         uint32 period,
 *         uint8[3] revenueSplit,
 *         address originalOwner,
 *         address thirdParty,
 *         uint32 whitelistId,
 *         address[] revenueTokens,
 *         uint256 timeCreated
 *     );
 */
export function handleGotchiLendingAdded(event: GotchiLendingAdded): void {
  const nftId = generateNftId("AAVEGOTCHI", event.params.tokenId);
  const nft = Nft.load(nftId);
  if (!nft) {
    log.debug("[GotchiLendingAdded]: Aavegotchi {} does not exist", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  // create rental offer
  const rentalOffer = new RentalOffer(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`
  );
  rentalOffer.nft = nftId;
  rentalOffer.lender = event.params.lender.toHexString().toLowerCase();
  rentalOffer.createdAt = event.params.timeCreated;
  rentalOffer.creationTxHash = event.transaction.hash.toHex();
  rentalOffer.duration = event.params.period;
  rentalOffer.feeAmount = event.params.initialCost;
  rentalOffer.feeToken = GHST_TOKEN_ADDRESS;

  rentalOffer.profitShareTokens = event.params.revenueTokens.map<string>((t) =>
    t.toHex().toLowerCase()
  );
  rentalOffer.profitShareSplit = event.params.revenueSplit.map<BigInt>((s) =>
    BigInt.fromI32(s).times(ONE_ETHER)
  );

  rentalOffer.save();

  // link rental offer to nft
  nft.currentRentalOffer = rentalOffer.id;
  nft.save();
}
