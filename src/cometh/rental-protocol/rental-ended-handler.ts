import { log } from "@graphprotocol/graph-ts";
import { Nft, Rental } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { COMETHSPACESHIP } from "../../utils/constants";
import { RentalEnded } from "../../../generated/ComethRentalProtocol/ComethRentalProtocol";
import { SPACESHIP_ADDRESS } from "../../utils/addresses";

/**
 *     event RentalEnded(
 *       address indexed lender,
 *       address indexed tenant,
 *       address token,
 *       uint256 tokenId
 *   );
 */
export function handleRentalEnded(event: RentalEnded): void {
  if (event.params.token.toHexString() != SPACESHIP_ADDRESS) {
    log.debug(
      "[handleRentalEnded] NFT {} is not a spaceship, tx: {}, skipping...",
      [event.params.tokenId.toString(), event.transaction.hash.toHex()]
    );
    return;
  }

  const nftId = generateNftId(COMETHSPACESHIP, event.params.tokenId);

  const nft = Nft.load(nftId);
  if (!nft) {
    log.debug("[handleRentalEnded] Spaceship {} does not exist, tx: {}", [
      event.params.tokenId.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const currentRentalId = nft.currentRental;

  if (!currentRentalId) {
    log.warning(
      "[handleRentalEnded] NFT {} has no rental, tx: {}, skipping ...",
      [nft.id, event.transaction.hash.toHex()]
    );
    return;
  }

  const currentRental = Rental.load(currentRentalId!);

  if (!currentRental) {
    throw new Error(
      "[handleRentalEnded] Rental " +
        currentRentalId! +
        " does not exist, tx: " +
        event.transaction.hash.toHex()
    );
  }

  // update rental
  currentRental.expiration_date = event.block.timestamp;
  currentRental.expiredTxHash = event.transaction.hash.toHex();
  currentRental.save();

  // remove current rental from nft, because it ended
  nft.currentRental = null;
  nft.save();

  log.warning("[handleRentalEnded] NFT {} rental {} ended, tx: {}", [
    nftId,
    currentRentalId!,
    event.transaction.hash.toHex(),
  ]);
}
