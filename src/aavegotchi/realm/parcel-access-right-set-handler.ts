import { log, BigInt } from '@graphprotocol/graph-ts'
import { ParcelAccessRightSet } from '../../../generated/Realm/RealmDiamond'
import { AavegotchiLand, Nft } from '../../../generated/schema'
import { generateNftId } from '../../utils/misc'
import { AccessRight, ActionRight } from '../../utils/types'
import {
  endPreviousRental,
  updateLandRights,
  isLandRightChanged,
  isNewDirectRental,
  updateLandDirectRentalTaker,
  createLandDirectRental,
} from '../../utils/land-rentals'
import { AAVEGOTCHI_LAND } from '../../utils/constants'

/**
 *  event ParcelAccessRightSet(
 *        uint256 _realmId,
 *        uint256 _actionRight,
 *        uint256 _accessRight
 *  );
 *
 *  Action Rights:
 *     0: Channeling - only owner
 *     1: Empty Reservoir - only owner
 *     2: Equip Installations
 *     3: Equip Tiles
 *     4: Unequip Installations
 *     5: Unequip Tiles
 *     6: Upgrade Installations
 *
 *  Access Rights:
 *     0: Only Owner
 *     1: Owner + Lent Out
 *     2: Whitelisted Only
 *     3: Allow blacklisted
 *     4: Anyone
 */
export function handleParcelAccessRightSet(event: ParcelAccessRightSet): void {
  // To start or end a rental, the action right must be Channeling or Empty Reservoir
  if (event.params._actionRight.gt(BigInt.fromI32(ActionRight.EMPTY_RESERVOIR))) {
    log.debug('[handleParcelAccessRightSet] Action right {} is not Channeling or Empty Reservoir, tx: {}', [
      event.params._actionRight.toString(),
      event.transaction.hash.toHex(),
    ])
    return
  }

  const nftId = generateNftId(AAVEGOTCHI_LAND, event.params._realmId)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.debug('[handleParcelAccessRightSet] NFT {} not found, tx: {}', [nftId, event.transaction.hash.toHex()])
    return
  }

  const land = AavegotchiLand.load(nft.id)

  if (!land) {
    log.debug('[handleParcelAccessRightSet] Land {} not found, tx: {}', [nft.id, event.transaction.hash.toHex()])
    return
  }

  // If the land rights are not changed, we don't do anything
  if (!isLandRightChanged(land, event.params._actionRight, event.params._accessRight, BigInt.zero())) {
    log.warning('[handleParcelAccessRightSet] Land {} rights are not changed, tx: {}', [
      nft.id,
      event.transaction.hash.toHex(),
    ])
    return
  }

  // If the land is changing rights in the same transaction, we update the actual direct rental
  if (!isNewDirectRental(nft, event.transaction.hash.toHex())) {
    log.warning(
      '[handleParcelWhitelistSet] Updating Land {} Direct Rental {} with Action Right {} and Acess Right {}, tx: {}',
      [
        nft.id,
        nft.currentDirectRental!,
        event.params._actionRight.toString(),
        event.params._accessRight.toString(),
        event.transaction.hash.toHex(),
      ],
    )

    // We update the land rights with the new access right
    const updatedLand = updateLandRights(land, event.params._actionRight, event.params._accessRight)

    updateLandDirectRentalTaker(nft, updatedLand)

    return
  }

  // We will always end the previous rental, if it exists
  endPreviousRental(nft, event.transaction.hash.toHex(), event.block.timestamp)

  // We update the land rights with the new access right and return the updated land
  const updatedLand = updateLandRights(land, event.params._actionRight, event.params._accessRight)

  // If the access right is ONLY_OWNER for both Channeling and Empty Reservoir, we don't create a rental and return
  if (
    land.channelingAccessRight.equals(BigInt.fromI32(AccessRight.ONLY_OWNER)) &&
    land.emptyReservoirAccessRight.equals(BigInt.fromI32(AccessRight.ONLY_OWNER))
  )
    return

  const directRental = createLandDirectRental(
    nft,
    updatedLand,
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.logIndex,
  )

  log.warning(
    '[handleParcelAccessRightSet] nftId {}, directRentalId {}, lender {}, taker {}, startedAt {}, startedTxHash {}',
    [
      directRental.nft,
      directRental.id,
      directRental.lender,
      directRental.taker!,
      directRental.startedAt.toString(),
      directRental.startedTxHash,
    ],
  )
}
