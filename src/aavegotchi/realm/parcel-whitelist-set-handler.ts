import { BigInt, log } from '@graphprotocol/graph-ts'
import { ParcelWhitelistSet } from '../../../generated/Realm/RealmDiamond'
import { AavegotchiLand, Nft } from '../../../generated/schema'
import { generateNftId } from '../../utils/misc'
import { AccessRight, ActionRight } from '../../utils/types'
import { createDirectRental, endPreviousRental, isLandRightChanged, updateLandRights } from '../../utils/land-rentals'
import { AAVEGOTCHI_LAND } from '../../utils/constants'

/**
 * event ParcelWhitelistSet(
 *      uint256 _realmId,
 *      uint256 _actionRight,
 *      uint256 _whitelistId
 *      );
 *
 *  Action Rights:
 *     0: Channeling -> whitelist
 *     1: Empty Reservoir -> ?
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
 *
 *  This event is only called when the access right is Whitelisted Only
 */
export function handleParcelWhitelistSet(event: ParcelWhitelistSet): void {
  // To start a rental, the action right must be Channeling or Empty Reservoir
  if (event.params._actionRight.gt(BigInt.fromI32(ActionRight.EMPTY_RESERVOIR))) {
    log.debug('[handleParcelWhitelistSet] Action right {} is not Channeling or Empty Reservoir, tx: {}', [
      event.params._actionRight.toString(),
      event.transaction.hash.toHex(),
    ])
    return
  }

  const nftId = generateNftId(AAVEGOTCHI_LAND, event.params._realmId)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.debug('[handleParcelWhitelistSet] NFT {} not found, tx: {}', [nftId, event.transaction.hash.toHex()])
    return
  }

  const land = AavegotchiLand.load(nft.id)

  if (!land) {
    log.debug('[handleParcelWhitelistSet] Land {} not found, tx: {}', [nft.id, event.transaction.hash.toHex()])
    return
  }

  // If the land rights are not changed, we don't do anything
  if (
    !isLandRightChanged(
      land,
      event.params._actionRight,
      BigInt.fromI32(AccessRight.WHITELISTED_ONLY),
      event.params._whitelistId,
    )
  ) {
    log.warning('[handleParcelAccessRightSet] Land {} rights are not changed, tx: {}', [
      nft.id,
      event.transaction.hash.toHex(),
    ])
    return
  }

  // We always end the previous rental, if it exists
  endPreviousRental(nft, event.transaction.hash.toHex(), event.block.timestamp)

  // We update the land rights with the new access right and return the updated land
  const updatedLand = updateLandRights(
    land,
    event.params._actionRight,
    BigInt.fromI32(AccessRight.WHITELISTED_ONLY),
    event.params._whitelistId,
  )

  // If the access right is not ONLY_OWNER for both Channeling and Empty Reservoir, we create a new direct rental
  const directRental = createDirectRental(
    nft,
    updatedLand,
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.logIndex,
  )

  log.warning(
    '[handleParcelWhitelistSet] nftId {}, directRentalId {}, lender {}, taker {}, startedAt {}, startedTxHash {}',
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
