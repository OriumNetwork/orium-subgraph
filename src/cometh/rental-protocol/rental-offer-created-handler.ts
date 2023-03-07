import { BigInt } from "@graphprotocol/graph-ts";
import { RentalOffer } from "../../../generated/schema";
import { COMETHSPACESHIP } from "../../utils/constants";
import { RentalOfferCreated } from "../../../generated/ComethRentalProtocol/ComethRentalProtocol";
import { loadNfts } from "../../utils/misc";
/**
 *    event RentalOfferCreated(
 *       uint256 indexed nonce,
 *       address indexed maker,
 *       address taker,
 *       NFT[] nfts,
 *       address feeToken,
 *       uint256 feeAmount,
 *       uint256 deadline
 *   );
 */
export function handleRentalOfferCreated(event: RentalOfferCreated): void {
  // get nft
  const nfts = loadNfts(
    event.params.nfts.map<BigInt>((nft) => nft.tokenId),
    COMETHSPACESHIP
  );

  // create rental offer
  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    const rentalOfferId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
    const rentalOffer = new RentalOffer(rentalOfferId);
    rentalOffer.nft = nft.id;
    rentalOffer.lender = event.params.maker.toHexString();
    rentalOffer.createdAt = event.block.timestamp;
    rentalOffer.creationTxHash = event.transaction.hash.toHex();
    rentalOffer.duration = event.params.nfts[i].duration;
    rentalOffer.feeAmount = event.params.feeAmount;
    rentalOffer.feeToken = event.params.feeToken.toHexString();

    rentalOffer.profitShareTokens = [event.params.feeToken.toHexString()]; // TODO: check if this is correct
    rentalOffer.profitShareSplit = [
      //TODO: check if this is correct
      BigInt.fromI32(event.params.nfts[i].basisPoints),
    ];
    rentalOffer.save();

    // link rental offer to nft
    nft.currentRentalOffer = rentalOfferId;
    nft.save();
  }
}
