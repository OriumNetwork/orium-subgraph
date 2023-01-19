import { BigInt } from "@graphprotocol/graph-ts";
import { Rental } from "../../../generated/schema";
import { UpdateUser } from "../../../generated/WTraveler/WChronosTraveler";
import { generateNftId, loadNft } from "../../utils/misc";
import { log } from "@graphprotocol/graph-ts";

const TYPE = "WTRAVELER";
const PLATFORM = "Chronos";
const STATE = "WTRAVELER";

/**
 * @event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);
 */

export function handleUpdateUser(event: UpdateUser): void {
  const tokenId = event.params.tokenId;
  const user = event.params.user.toHexString();
  const expires = event.params.expires;

  const nft = loadNft(TYPE, tokenId);

  const rentalId =
    PLATFORM +
    "-" +
    TYPE +
    "-" +
    event.transaction.hash.toHex() +
    "-" +
    event.logIndex.toString();

  const rental = new Rental(rentalId);
  rental.nftEntity = generateNftId(TYPE, tokenId);
  rental.borrower = user;
  rental.lender = nft.currentOwner;
  rental.tokenId = tokenId;
  rental.period = expires;
  rental.save();

  nft.currentRental = rentalId;
  nft.save();

  log.warning(
    "[handleUpdateUser] Rental created: {} for NFT: {}, expires: {}, borrower: {}, lender: {}, tx: {}",
    [
      rentalId,
      nft.id,
      rental.period.toString(),
      rental.borrower!,
      rental.lender!,
      event.transaction.hash.toHex(),
    ]
  );
}
