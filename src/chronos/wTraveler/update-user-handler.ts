import { Account, Rental } from "../../../generated/schema";
import { UpdateUser } from "../../../generated/WTraveler/WChronosTraveler";
import { generateNftId, loadNft, loadRental } from "../../utils/misc";
import { log } from "@graphprotocol/graph-ts";
import { ZERO_ADDRESS } from "../../utils/constants";

const TYPE = "WTRAVELER";
const PLATFORM = "Chronos";

/**
 * @event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);
 */

export function handleUpdateUser(event: UpdateUser): void {
  const tokenId = event.params.tokenId;
  const user = event.params.user.toHexString();
  const expires = event.params.expires;

  const nft = loadNft(TYPE, tokenId);

  if (user == ZERO_ADDRESS) {
    const currentRentalId = nft.currentRental;
    if (!currentRentalId) {
      log.warning(
        "[handleUpdateUser] No current rental for NFT: {}, user: {}, tx: {}",
        [nft.id, user, event.transaction.hash.toHex()]
      );
      return;
    }

    const currentRental = loadRental(currentRentalId!);
    currentRental.expiration_date = event.block.timestamp;
    currentRental.save();

    nft.currentRental = null;
    nft.save();
    log.warning(
      "[handleUpdateUser] User is address zero, setting current rental to null for NFT {}, rental {}, tx: {}",
      [nft.id, currentRentalId!, event.transaction.hash.toHex()]
    );
    return;
  }

  let userAccount = Account.load(user);

  if (!userAccount) {
    userAccount = new Account(user);
    userAccount.save();
  }

  const rentalId =
    PLATFORM +
    "-" +
    TYPE +
    "-" +
    event.transaction.hash.toHex() +
    "-" +
    event.logIndex.toString();

  const rental = new Rental(rentalId);
  rental.nft = generateNftId(TYPE, tokenId);
  rental.borrower = userAccount.id;
  rental.lender = nft.currentOwner;
  rental.start_date = event.block.timestamp;
  rental.expiration_date = expires;
  rental.save();

  if (expires.gt(event.block.timestamp)) {
    nft.currentRental = rentalId;
  } else {
    nft.currentRental = null;
  }

  nft.save();

  log.warning(
    "[handleUpdateUser] Rental created: {} for NFT: {}, expires: {}, borrower: {}, lender: {}, tx: {}",
    [
      rentalId,
      nft.id,
      expires.toString(),
      rental.borrower,
      rental.lender,
      event.transaction.hash.toHex(),
    ]
  );
}
