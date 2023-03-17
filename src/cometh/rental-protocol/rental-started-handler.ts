import { log } from "@graphprotocol/graph-ts";
import { Nft, Rental } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { COMETHSPACESHIP } from "../../utils/constants";
import { RentalStarted } from "../../../generated/ComethRentalProtocol/ComethRentalProtocol";
import { SPACESHIP_ADDRESS } from "../../utils/addresses";

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
export function handleRentalStarted(event: RentalStarted): void {
  if (event.params.token.toHexString() != SPACESHIP_ADDRESS) {
    log.debug(
      "[handleRentalStarted] NFT {} is not a spaceship, tx: {}, skipping...",
      [event.params.tokenId.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  const nftId = generateNftId(COMETHSPACESHIP, event.params.tokenId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug(
      "[handleRentalStarted] Spaceship {} does not exist, tx: {}, skipping...",
      [event.params.tokenId.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  const currentRentalOfferId = nft.currentRentalOffer;

  if (!currentRentalOfferId) {
    log.warning(
      "[handleRentalStarted] NFT {} has no rental offer, tx: {}, skipping...",
      [nft.id, event.transaction.hash.toHex()]
    );
    return;
  }

  const previousRental = nft.currentRental;
  if (previousRental) {
    throw new Error(
      "[handleRentalStarted] NFT " +
        nftId +
        " already has a rental " +
        previousRental +
        ", tx: " +
        event.transaction.hash.toHex()
    );
  }

  const currentRental = new Rental(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`
  );
  currentRental.nft = nftId;
  currentRental.lender = event.params.lender.toHexString();
  currentRental.borrower = event.params.tenant.toHexString();
  currentRental.start_date = event.block.timestamp;
  currentRental.startedTxHash = event.transaction.hash.toHex();
  currentRental.rentalOffer = currentRentalOfferId;
  currentRental.expiration_date = event.params.end;
  currentRental.save();

  // remove current rental offer from nft, because it has been executed, and link rental to nft
  nft.currentRentalOffer = null;
  nft.currentRental = currentRental.id;
  nft.save();

  log.warning(
    "[handleRentalStarted] NFT {} has been rented, rentalId: {}, rentalOfferId: {}, tx: {}",
    [
      nftId,
      currentRental.id,
      currentRentalOfferId!,
      event.transaction.hash.toHex(),
    ]
  );
}
