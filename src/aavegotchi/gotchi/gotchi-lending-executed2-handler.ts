import { BigInt, log } from '@graphprotocol/graph-ts'
import { GotchiLendingExecuted } from '../../../generated/AavegotchiDiamondUpdate/AavegotchiDiamondUpdate'
import { Nft, Rental, RentalOffer } from '../../../generated/schema'
import { generateNftId } from '../../utils/misc'
import { AAVEGOTCHI } from '../../utils/constants'

/**
 * event GotchiLendingExecuted(
 *        uint32 indexed listingId,
 *        address indexed lender,
 *        address indexed borrower,
 *        uint32 tokenId,
 *        uint96 initialCost,
 *        uint32 period,
 *        uint8[3] revenueSplit,
 *        address originalOwner,
 *        address thirdParty,
 *        uint32 whitelistId,
 *        address[] revenueTokens,
 *        uint256 timeAgreed
 *  );
 */
export function handleGotchiLendingExecuted2(event: GotchiLendingExecuted): void {
  const nftId = generateNftId(AAVEGOTCHI, event.params.param0.tokenId)

  const nft = Nft.load(nftId)
  if (!nft) {
    log.debug('[handleGotchiLendingExecuted] Aavegotchi {} does not exist, tx: {}', [
      event.params.param0.tokenId.toString(),
      event.transaction.hash.toHex(),
    ])
    return
  }

  const currentRentalOfferId = nft.currentRentalOffer

  if (!currentRentalOfferId) {
    //probably it is a legacy rental offer not tracked before rental upgrade
    log.warning('[handleGotchiLendingExecuted] NFT {} has no rental offer, skipping...', [nft.id])
    return
  }

  const rentalOffer = RentalOffer.load(currentRentalOfferId!)

  if (!rentalOffer) {
    throw new Error(
      '[handleGotchiLendingExecuted] No rental offer with id ' +
      currentRentalOfferId! +
      ' was found for token id: ' +
      event.params.param0.tokenId.toString() +
      ', lender: ' +
      event.params.param0.lender.toHexString() +
      ', tx: ' +
      event.transaction.hash.toHex()
    )
  }

  rentalOffer.executionTxHash = event.transaction.hash.toHex()
  rentalOffer.save()

  const previoustRental = nft.currentRental
  if (previoustRental) {
    throw new Error(
      '[handleGotchiLendingExecuted] NFT ' +
      nftId +
      ' already has a rental ' +
      previoustRental +
      ', tx: ' +
      event.transaction.hash.toHex()
    )
  }

  const currentRental = new Rental(`${event.transaction.hash.toHex()}-${event.logIndex.toString()}`)
  currentRental.nft = nftId
  currentRental.lender = event.params.param0.lender.toHexString().toLowerCase()
  currentRental.borrower = event.params.param0.borrower.toHexString().toLowerCase()
  currentRental.startedAt = event.block.timestamp
  currentRental.startedTxHash = event.transaction.hash.toHex()
  currentRental.rentalOffer = currentRentalOfferId
  currentRental.expirationDate = event.block.timestamp.plus(event.params.param0.period)
  currentRental.beneficiaries = [currentRental.lender, currentRental.borrower, event.params.param0.thirdParty.toHexString().toLowerCase()]
  currentRental.save()

  // remove current rental offer from nft, because it has been executed, and link rental to nft
  nft.currentRentalOffer = null
  nft.currentRental = currentRental.id
  // Since aavegotchi only allows one offer at a time, we can set the expiration date to zero
  nft.lastOfferExpirationAt = BigInt.zero();
  nft.save()

  log.warning('[handleGotchiLendingExecuted] NFT {} has been rented, rentalId: {}, rentalOfferId: {}', [
    nftId,
    currentRental.id,
    currentRentalOfferId!,
  ])
}
