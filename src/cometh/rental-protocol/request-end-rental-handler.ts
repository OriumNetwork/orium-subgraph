import { log } from '@graphprotocol/graph-ts'
import { Nft, Rental } from '../../../generated/schema'
import { RequestToEndRentalPrematurely } from '../../../generated/ComethRentalProtocol/ComethRentalProtocol'
import { SPACESHIP_ADDRESS } from '../../utils/addresses';
import { generateNftId } from '../../utils/misc';

/**
 *      event RequestToEndRentalPrematurely(
 *            address indexed requester, 
 *            address indexed token, 
 *            uint256 indexed tokenId
 *      );
 */

export function handleRequestToEndRentalPrematurely(event: RequestToEndRentalPrematurely): void {
  const nftId = generateNftId(SPACESHIP_ADDRESS, event.params.tokenId);
  const nft = Nft.load(nftId);

  if (!nft) {
    log.debug("[handleRequestToEndRentalPrematurely] NFT not found: {}, tx {} ignoring...", [nftId, event.transaction.hash.toHex()]);
    return;
  }

  const currentRentalId = nft.currentRental;

  if (!currentRentalId) {
    log.debug("[handleRequestToEndRentalPrematurely] NFT {} has no current rental, tx {} ignoring...", [nft.id, event.transaction.hash.toHex()]);
    return;
  }

  const currentRental = Rental.load(currentRentalId!);

  if (!currentRental) {
    log.debug("[handleRequestToEndRentalPrematurely] Rental {} does not exist in NFT {}, tx {} ignoring...", [currentRentalId!, nftId, event.transaction.hash.toHex()]);
    return;
  }

  // update rental
  currentRental.expirationDate = event.block.timestamp;
  currentRental.save();

  log.warning("[handleRequestToEndRentalPrematurely] changing NFT {} rental expiration to {} tx {}", [nft.id, event.block.timestamp.toString(), event.transaction.hash.toHex()]);
}
