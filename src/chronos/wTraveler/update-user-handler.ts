import { Account, Nft, Rental } from '../../../generated/schema'
import { UpdateUser } from '../../../generated/WTraveler/WChronosTraveler'
import { generateNftId, loadNft, loadRental } from '../../utils/misc'
import { BigInt, log } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS } from '../../utils/constants'

const TYPE = 'WTRAVELER'
const PLATFORM = 'Chronos'

/**
 * @event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);
 */

export function handleUpdateUser(event: UpdateUser): void {
  const tokenId = event.params.tokenId
  const user = event.params.user.toHexString()
  const expires = event.params.expires

  const nft = loadNft(TYPE, tokenId)

  updatePreviousRental(nft, event.block.timestamp)

  if (user == ZERO_ADDRESS || expires.lt(event.block.timestamp)) {
    log.warning('[handleUpdateUser] User is zero address or rental is expired, removing rental for NFT: {}, tx: {}', [
      nft.id,
      event.transaction.hash.toHex(),
    ])

    nft.currentRental = null
    nft.save()
    return
  }

  let userAccount = Account.load(user)

  if (!userAccount) {
    userAccount = new Account(user)
    userAccount.save()
  }

  const rentalId = PLATFORM + '-' + TYPE + '-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString()

  const rental = new Rental(rentalId)
  rental.nft = generateNftId(TYPE, tokenId)
  rental.borrower = userAccount.id
  rental.lender = nft.currentOwner
  rental.startedAt = event.block.timestamp
  rental.expirationDate = expires
  rental.save()

  nft.currentRental = rentalId
  nft.save()

  log.warning('[handleUpdateUser] Rental created: {} for NFT: {}, expires: {}, borrower: {}, lender: {}, tx: {}', [
    rentalId,
    nft.id,
    expires.toString(),
    rental.borrower,
    rental.lender,
    event.transaction.hash.toHex(),
  ])
}

function updatePreviousRental(nft: Nft, blockTimestamp: BigInt): void {
  const previousRentalId = nft.currentRental
  if (!previousRentalId) {
    return
  }

  const rental = loadRental(previousRentalId!)

  if (rental.endedAt) {
    if (rental.endedAt!.lt(blockTimestamp)) {
      return
    }
  }

  rental.endedAt = blockTimestamp
  rental.save()
}
