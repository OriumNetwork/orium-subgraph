import { BigInt } from "@graphprotocol/graph-ts";
import { Nft } from "../../generated/schema";

export function generateNftId(type: string, tokenId: BigInt): string {
  return type + "-" + tokenId;
}

export function loadNft(type: string, tokenId: BigInt): Nft {
  const nftId = generateNftId(type, tokenId);
  const nft = Nft.load(nftId);
  if (!nft) {
    throw new Error("[loadNft] NFT not found: " + nftId);
  }

  return nft;
}
