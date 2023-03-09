import { BigInt } from "@graphprotocol/graph-ts";
import { RentalOffer } from "../../../generated/schema";
import { COMETHSPACESHIP } from "../../utils/constants";
import { RentalOfferCreated } from "../../../generated/ComethRentalProtocol/ComethRentalProtocol";
import { loadNfts } from "../../utils/misc";
import { log } from "@graphprotocol/graph-ts";
import { SPACESHIP_ADDRESS } from "../../utils/addresses";
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
  const tokenIds = event.params.nfts.map<BigInt>((nft) => {
    return nft.token.toHexString() == SPACESHIP_ADDRESS
      ? nft.tokenId
      : BigInt.fromI32(-1);
  });

  //filter out non spaceship nfts
  const filteredTokenIds = tokenIds.filter(
    (tokenId) => tokenId != BigInt.fromI32(-1)
  );

  if (filteredTokenIds.length == 0) {
    log.debug(
      "[handleRentalOfferCreated] No spaceship nfts with valid address found in rental offer, tx: {}",
      [event.transaction.hash.toHex()]
    );
    return;
  }

  const type = COMETHSPACESHIP;
  const nfts = loadNfts(filteredTokenIds, type);

  if (nfts.length == 0) {
    log.debug(
      "[handleRentalOfferCreated] No valid spaceship nfts with valid id found in rental offer, tx: {}",
      [event.transaction.hash.toHex()]
    );
    return;
  }

  // create rental offer
  const rentalOfferId = `${event.transaction.from.toHexString()}-${
    event.params.nonce
  }`;
  const rentalOffer = new RentalOffer(rentalOfferId);
  rentalOffer.nfts = nfts.map<string>((nft) => nft.id);
  rentalOffer.lender = event.params.maker.toHexString();
  rentalOffer.createdAt = event.block.timestamp;
  rentalOffer.creationTxHash = event.transaction.hash.toHex();
  rentalOffer.duration = event.params.nfts.map<BigInt>((nft) => nft.duration);
  rentalOffer.feeAmount = event.params.feeAmount;
  rentalOffer.feeToken = event.params.feeToken.toHexString();
  rentalOffer.save();

  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    // link rental offer to nft
    nft.currentRentalOffer = rentalOfferId;
    nft.rentalOfferHistory = nft.rentalOfferHistory.concat([rentalOfferId]);
    nft.save();
    log.warning(
      "[handleRentalOfferCreated] RentalOffer {} created for NFT {}, tx: {}",
      [rentalOfferId, nft.id, event.transaction.hash.toHex()]
    );
  }
}
