import { log } from "@graphprotocol/graph-ts";
import { RewardsDistributed } from "../../../generated/ComethBorrowedSpaceship/ComethBorrowedSpaceship";
import { Nft, RentalEarning } from "../../../generated/schema";
import { COMETHSPACESHIP } from "../../utils/constants";
import { generateNftId } from "../../utils/misc";
/**
 * event RewardsDistributed(
 *      uint256 indexed tokenId, 
 *      address indexed recipient, 
 *      address indexed token, 
 *      uint256 amount
 * );
 */

export function handleRewardsDistributed(event: RewardsDistributed): void {
  const nftId = generateNftId(COMETHSPACESHIP, event.params.tokenId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug("[handleRewardsDistributed] NFT {} not found, tx {}", [nftId, event.transaction.hash.toHex()]);
    return;
  }

  const rentalId = nft.currentRental;

  if (!rentalId) {
    log.debug("[handleRewardsDistributed] NFT {} not rented, tx {}", [nftId, event.transaction.hash.toHex()]);
    return;
  }

  const rentalEarning = new RentalEarning(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
  rentalEarning.tokenAddress = event.params.token.toHexString();
  rentalEarning.amount = event.params.amount;
  rentalEarning.nft = nftId;
  rentalEarning.rental = rentalId!;
  rentalEarning.txHash = event.transaction.hash.toHex();
  rentalEarning.timestamp = event.block.timestamp;
  rentalEarning.eventName = event.logType ? event.logType!.toString() : "";
  rentalEarning.save();

  log.warning("[handleRewardsDistributed] tokenAddress {}, amount {}, nftId {}, rentalId {}, txHash {}, timestamp {}, eventName {}", [
    rentalEarning.tokenAddress,
    rentalEarning.amount.toString(),
    rentalEarning.nft,
    rentalEarning.rental,
    rentalEarning.txHash,
    rentalEarning.timestamp.toString(),
    rentalEarning.eventName,
  ]);
}
