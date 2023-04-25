import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { buildEventParamAddress, buildEventParamUint } from "../fixture";
import {
  RentalEnded,
  RentalOfferCancelled,
  RentalOfferCreated,
  RentalStarted,
} from "../../generated/ComethRentalProtocol/ComethRentalProtocol";
import { ComethNFT } from "../../src/utils/types";
import { log } from "@graphprotocol/graph-ts";
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

export function createRentalOfferCreatedEvent(
  nonce: string,
  maker: string,
  taker: string,
  nfts: ComethNFT[],
  feeToken: string,
  feeAmount: string,
  expirationDate: string
): RentalOfferCreated {
  const event = changetype<RentalOfferCreated>(newMockEvent());
  let nftsTuple: ethereum.Tuple[] = new Array<ethereum.Tuple>();

  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    const nftTuple = new ethereum.Tuple();
    nftTuple.push(ethereum.Value.fromAddress(Address.fromString(nft.token)));
    nftTuple.push(
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(nft.tokenId))
    );
    nftTuple.push(
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(nft.duration))
    );
    nftTuple.push(
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(nft.basisPoints))
    );
    nftsTuple.push(nftTuple);
  }

  event.parameters = new Array<ethereum.EventParam>();
  event.parameters.push(buildEventParamUint("nonce", nonce));
  event.parameters.push(buildEventParamAddress("maker", maker));
  event.parameters.push(buildEventParamAddress("taker", taker));
  event.parameters.push(
    new ethereum.EventParam("nfts", ethereum.Value.fromTupleArray(nftsTuple))
  );
  event.parameters.push(buildEventParamAddress("feeToken", feeToken));
  event.parameters.push(buildEventParamUint("feeAmount", feeAmount));
  event.parameters.push(buildEventParamUint("deadline", expirationDate));
  return event;
}

/**
 * event RentalOfferCancelled(
 *    uint256 indexed nonce,
 *    address indexed maker
 * );
 */
export function createRentalOfferCancelledEvent(
  nonce: string,
  maker: string
): RentalOfferCancelled {
  const event = changetype<RentalOfferCancelled>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();
  event.parameters.push(buildEventParamUint("nonce", nonce));
  event.parameters.push(buildEventParamAddress("maker", maker));
  event.transaction.from = Address.fromString(maker);
  return event;
}

/**
 *     event RentalStarted(
 *        uint256 indexed nonce,
 *        address indexed lender,
 *        address indexed tenant,
 *        address token,
 *        uint256 tokenId,
 *        uint64 duration,
 *        uint16 basisPoints,
 *        uint256 start,
 *        uint256 end
 *    );
 */
export function createRentalStartedEvent(
  nonce: string,
  lender: string,
  tenant: string,
  token: string,
  tokenId: string,
  duration: string,
  basisPoints: string,
  start: string,
  end: string
): RentalStarted {
  const event = changetype<RentalStarted>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();

  event.parameters.push(buildEventParamUint("nonce", nonce));
  event.parameters.push(buildEventParamAddress("lender", lender));
  event.parameters.push(buildEventParamAddress("tenant", tenant));
  event.parameters.push(buildEventParamAddress("token", token));
  event.parameters.push(buildEventParamUint("tokenId", tokenId));
  event.parameters.push(buildEventParamUint("duration", duration));
  event.parameters.push(buildEventParamUint("basisPoints", basisPoints));
  event.parameters.push(buildEventParamUint("start", start));
  event.parameters.push(buildEventParamUint("end", end));

  return event;
}

/**
 *     event RentalEnded(
 *       address indexed lender,
 *       address indexed tenant,
 *       address token,
 *       uint256 tokenId
 *   );
 */
export function createRentalEndedEvent(
  lender: string,
  tenant: string,
  token: string,
  tokenId: string
): RentalEnded {
  const event = changetype<RentalEnded>(newMockEvent());
  event.parameters = new Array<ethereum.EventParam>();

  event.parameters.push(buildEventParamAddress("lender", lender));
  event.parameters.push(buildEventParamAddress("tenant", tenant));
  event.parameters.push(buildEventParamAddress("token", token));
  event.parameters.push(buildEventParamUint("tokenId", tokenId));

  return event;
}
