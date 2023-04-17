import { BigInt } from "@graphprotocol/graph-ts";
import { Nft, Rental, RentalOffer } from "../../generated/schema";

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

export function updateNftRentalOfferHistory(
  rentalOffer: RentalOffer,
  nft: Nft
): void {
  nft.rentalOfferHistory = nft.rentalOfferHistory ? nft.rentalOfferHistory!.concat([rentalOffer.id]) : [rentalOffer.id];
  nft.save();
}