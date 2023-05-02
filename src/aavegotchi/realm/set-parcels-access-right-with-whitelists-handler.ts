import { log, BigInt } from "@graphprotocol/graph-ts";
import { SetParcelsAccessRightWithWhitelistsCall } from "../../../generated/Realm/RealmDiamond";
import { DirectRental, Nft } from "../../../generated/schema";
import { generateNftId } from "../../utils/misc";
import { AAVEGOTCHI_LAND } from "../../utils/constants";
import { AccessRight, ActionRight } from "../../utils/types";

/**
 *   function setParcelsAccessRights(
        uint256[] calldata _realmIds,
        uint256[] calldata _actionRights,
        uint256[] calldata _accessRights
    ) 
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
export function handleSetParcelsAccessRightWithWhitelists(fn: SetParcelsAccessRightWithWhitelistsCall): void {

    // Get all nfts with their access rights for each action right set in the function call
    const nfts = getNftsWithAccessRights(fn.inputs._realmIds, fn.inputs._actionRights, fn.inputs._accessRights) as Map<BigInt, Map<BigInt, BigInt>>;

    for (let i = 0; i < fn.inputs._realmIds.length; i++) {
        const nftId = generateNftId(AAVEGOTCHI_LAND, fn.inputs._realmIds[i]);
        const nft = Nft.load(nftId);

        // Skip if nft does not exist in the subgraph
        if (!nft) {
            log.debug("[handleSetParcelsAccessRightWithWhitelists] Nft AAVEGOTCHI_LAND-{} not found, skipping, tx {}", [nftId, fn.transaction.hash.toHex()]);
            continue;
        }

        // No matter what, end the previous direct rental if it exists
        endPreviousDirectRental(nft, fn.transaction.hash.toHex(), fn.block.timestamp);

        // Once we garantee that previous direct rental is ended, we can safely set update current direct rental to a new one
        updateNftDirectRental(
            nft,
            nfts.get(fn.inputs._realmIds[i]).get(BigInt.fromI32(ActionRight.CHANNELING)),
            nfts.get(fn.inputs._realmIds[i]).get(BigInt.fromI32(ActionRight.EMPTY_RESERVOIR)),
            fn.transaction.hash.toHex(),
            fn.block.timestamp,
            fn.inputs._whitelistIds[i]
        );

    }
}


function getNftsWithAccessRights(realmIds: BigInt[], actionRights: BigInt[], accessRights: BigInt[]): Map<BigInt, Map<BigInt, BigInt>> {
    const nfts = new Map<BigInt, Map<BigInt, BigInt>>();

    for (let i = 0; i < realmIds.length; i++) {
        const realmId = realmIds[i];
        const actionRight = actionRights[i];
        const accessRight = accessRights[i];

        // Skip if action right is not channeling or empty reservoir
        if (actionRight.gt(BigInt.fromI32(ActionRight.EMPTY_RESERVOIR))) {
            log.debug("[handleSetParcelsAccessRightWithWhitelists] Skipping action right: {} for AAVEGOTCHI_LAND-{}, tx {}", [actionRight.toString(), realmId.toString(), accessRight.toString()]);
            continue;
        };

        if (!nfts.has(realmId)) {


            nfts.set(realmId, new Map<BigInt, BigInt>());
        }

        nfts.get(realmId).set(actionRight, accessRight)
    }

    return nfts;
}

function endPreviousDirectRental(nft: Nft, txHash: string, blockTimestamp: BigInt): void {
    const rentalId = nft.currentDirectRental;

    if (!rentalId) {
        log.debug("[handleSetParcelsAccessRightWithWhitelists] No direct rental found for {}, tx {}", [nft.id.toString(), txHash]);
        return;
    }

    const rental = DirectRental.load(rentalId!);

    if (!rental) {
        log.debug("[handleSetParcelsAccessRightWithWhitelists] Direct rental {} not found for {}, tx {}", [rentalId!.toString(), nft.id.toString(), txHash]);
        return;
    }

    rental.endedAt = blockTimestamp;
    rental.endedTxHash = txHash;
    rental.save();

    nft.currentDirectRental = null;
    nft.save();
}

function updateNftDirectRental(nft: Nft, chanellingAccessRight: BigInt, emptyReservoirAccessRight: BigInt, txHash: string, blockTimestamp: BigInt, whitelistId: BigInt): void {
    // If both action rights are only owner, skip
    if (chanellingAccessRight.equals(BigInt.fromI32(AccessRight.ONLY_OWNER)) && emptyReservoirAccessRight.equals(BigInt.fromI32(AccessRight.ONLY_OWNER))) return;

    const directRental = new DirectRental(`${txHash}-${blockTimestamp}`);
    directRental.nft = nft.id;
    directRental.lender = nft.currentOwner;
    directRental.taker = whitelistId.toString();
    directRental.lender = nft.currentOwner;
    directRental.startedAt = blockTimestamp;
    directRental.startedTxHash = txHash;
    directRental.save();

    nft.currentDirectRental = directRental.id;
    nft.save();

    log.warning("[handleSetParcelsAccessRightWithWhitelists] Direct rental started for {}, lender: {}, taker: {}, tx {}", [nft.id.toString(), directRental.lender, whitelistId.toString(), txHash]);
}