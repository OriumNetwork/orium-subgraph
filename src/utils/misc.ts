import { BigInt } from "@graphprotocol/graph-ts";
import { Nft, Rental, RentalOffer } from "../../generated/schema";
import { ONE_HUNDRED_ETHER } from "./constants";

export function generateNftId(type: string, tokenId: BigInt): string {
  return type + "-" + tokenId.toString();
}

export function loadNft(type: string, tokenId: BigInt): Nft {
  const nftId = generateNftId(type, tokenId);
  const nft = Nft.load(nftId);
  if (!nft) {
    throw new Error("[loadNft] NFT not found: " + nftId);
  }

  return nft;
}

export function loadNfts(tokenIds: BigInt[], type: string): Nft[] {
  const nfts: Nft[] = [];

  //we are using for instead of map, because closures are not supported in AssemblyScript
  for (let i = 0; i < tokenIds.length; i++) {
    const nftId = generateNftId(type, tokenIds[i]);
    const nft = Nft.load(nftId);
    if (!nft) {
      continue;
    }
    nfts.push(nft);
  }

  return nfts;
}

export function loadRental(rentalId: string): Rental {
  const rental = Rental.load(rentalId);
  if (!rental) {
    throw new Error("[loadRental] Rental not found: " + rentalId);
  }

  return rental;
}

export function loadRentalOffer(rentalOfferId: string): RentalOffer {
  const rentalOffer = RentalOffer.load(rentalOfferId);
  if (!rentalOffer) {
    throw new Error(
      "[loadRentalOffer] Rental offer not found: " + rentalOfferId
    );
  }

  return rentalOffer;
}

export function updateLastOfferExpirationAt(nft: Nft, expirationDate: BigInt): void {
  if (nft.lastOfferExpirationAt.gt(expirationDate)) return
  nft.lastOfferExpirationAt = expirationDate
  nft.save()
}

export function removeLastOfferExpirationAt(nftId: string, expirationDate: BigInt): void {
    const nft = Nft.load(nftId)

    if (!nft) return
    if(nft.lastOfferExpirationAt.gt(expirationDate)) return
    
    nft.lastOfferExpirationAt = BigInt.zero()
    nft.save()
}

export function basisPointToWeiPercentage(basisPoint: BigInt): BigInt {
  return basisPoint.times(BigInt.fromI32(10).pow(16))
}

export function getComethProfitShareSplit(basisPoints: BigInt): BigInt[] {
  const lenderShare = basisPointToWeiPercentage(basisPoints)
  const borrowerShare = ONE_HUNDRED_ETHER.minus(lenderShare)
  return [lenderShare, borrowerShare]
}