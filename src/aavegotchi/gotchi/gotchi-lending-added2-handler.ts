import { BigInt, log } from "@graphprotocol/graph-ts";
import { GotchiLendingAdded1 } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Nft, RentalOffer } from "../../../generated/schema";
import { generateNftId, updateLastOfferExpirationAt } from "../../utils/misc";
import { GHST_TOKEN_ADDRESS } from "../../utils/addresses";
import { MAX_EXPIRATION_DATE, ONE_ETHER } from "../../utils/constants";

/**
 *  
 * struct GotchiLendingAdd {
        uint32 listingId;
        address lender;
        uint32 tokenId;
        uint96 initialCost;
        uint32 period;
        uint8[3] revenueSplit;
        address originalOwner;
        address thirdParty;
        uint32 whitelistId;
        address[] revenueTokens;
        uint256 timeCreated;
        uint256 permissions;
    }
 *
 * event GotchiLendingAdded(GotchiLendingAdd);
 */
export function handleGotchiLendingAdded2(event: GotchiLendingAdded1): void {
  const nftId = generateNftId("AAVEGOTCHI", event.params.param0.tokenId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug(
      "[GotchiLendingAdded]: Aavegotchi {} does not exist, skiping...",
      [event.params.param0.tokenId.toString()]
    );
    return;
  }

  // create rental offer
  const rentalOfferId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const rentalOffer = new RentalOffer(rentalOfferId);
  rentalOffer.nfts = [nftId];
  rentalOffer.lender = event.params.param0.lender.toHexString().toLowerCase();
  rentalOffer.createdAt = event.params.param0.timeCreated;
  rentalOffer.creationTxHash = event.transaction.hash.toHex();
  rentalOffer.duration = [event.params.param0.period];
  rentalOffer.feeAmount = event.params.param0.initialCost;
  rentalOffer.feeToken = GHST_TOKEN_ADDRESS;
  rentalOffer.expirationDate = MAX_EXPIRATION_DATE;

  if (event.params.param0.whitelistId != BigInt.fromI32(0)) {
    rentalOffer.taker = event.params.param0.whitelistId.toString();
  }

  rentalOffer.profitShareTokens = event.params.param0.revenueTokens.map<string>((t) =>
    t.toHex().toLowerCase()
  );
  rentalOffer.profitShareSplit = event.params.param0.revenueSplit.map<BigInt>((s) =>
    BigInt.fromI32(s).times(ONE_ETHER)
  );

  rentalOffer.save();

  // link rental offer to nft
  nft.currentRentalOffer = rentalOfferId;
  nft.save();

  updateLastOfferExpirationAt(nft, rentalOffer.expirationDate);

  log.warning("[GotchiLendingAdded]: Gotchi {} added to rental offer {}", [
    nftId,
    rentalOffer.id,
  ]);
}
