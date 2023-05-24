import { assert, describe, test, clearStore, beforeEach, afterEach } from 'matchstick-as'
import { COMETHSPACESHIP, ONE_HUNDRED_ETHER, ZERO_ADDRESS } from '../../../src/utils/constants'
import { createMockSpaceship } from '../../fixture'
import { createRentalOfferCreatedEvent } from '../../fixtures/cometh-fixture'
import { handleRentalOfferCreated } from '../../../src/cometh'
import { ComethNFT } from '../../../src/utils/types'
import { SPACESHIP_ADDRESS } from '../../../src/utils/addresses'
import { BigInt } from '@graphprotocol/graph-ts'

const tokenId = '123'
const nonce = '1675888946'
const maker = '0x403e967b044d4be25170310157cb1a4bf10bdd0f'
const taker = '0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8'
let nfts: ComethNFT[] = [
  {
    token: SPACESHIP_ADDRESS,
    tokenId: tokenId,
    duration: '86400',
    basisPoints: '10000',
  },
]
const feeToken = '0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8'
const feeAmount = '1000000000000000000'
const expirationDate = '1675888946'

describe('Cometh - Rental Offer Created Event', () => {
  beforeEach(() => {
    createMockSpaceship(tokenId)
  })

  afterEach(() => {
    clearStore()
  })

  test('Should create rental offer', () => {
    const event = createRentalOfferCreatedEvent(nonce, maker, taker, nfts, feeToken, feeAmount, expirationDate)

    handleRentalOfferCreated(event)

    const rentalOfferId = `${maker}-${nonce}`
    const nftId = `${COMETHSPACESHIP}-${tokenId}`
    const lenderShare = BigInt.fromString(nfts[0].basisPoints).times(BigInt.fromI32(10).pow(16))
    const borrowerShare = ONE_HUNDRED_ETHER.minus(lenderShare).toString()

    assert.fieldEquals('RentalOffer', rentalOfferId, 'nfts', `[${nftId}]`)
    assert.fieldEquals('RentalOffer', rentalOfferId, 'lender', maker)
    assert.fieldEquals('RentalOffer', rentalOfferId, 'createdAt', event.block.timestamp.toString())
    assert.fieldEquals('RentalOffer', rentalOfferId, 'creationTxHash', event.transaction.hash.toHexString())
    assert.fieldEquals('RentalOffer', rentalOfferId, 'duration', `[${nfts[0].duration}]`)
    assert.fieldEquals('RentalOffer', rentalOfferId, 'feeToken', feeToken)
    assert.fieldEquals('RentalOffer', rentalOfferId, 'feeAmount', feeAmount)
    assert.fieldEquals('RentalOffer', rentalOfferId, 'profitShareSplit', `[${lenderShare}, ${borrowerShare}]`)
  })
  test('Should skip create rental offer if token id is invalid', () => {
    const invalidTokenId = '0'
    nfts[0].tokenId = invalidTokenId
    const event = createRentalOfferCreatedEvent(nonce, maker, taker, nfts, feeToken, feeAmount, expirationDate)
    assert.entityCount('RentalOffer', 0)
    handleRentalOfferCreated(event)
    assert.entityCount('RentalOffer', 0)
  })
  test('Should skip create rental offer if token address is invalid', () => {
    nfts[0].token = ZERO_ADDRESS
    const event = createRentalOfferCreatedEvent(nonce, maker, taker, nfts, feeToken, feeAmount, expirationDate)
    assert.entityCount('RentalOffer', 0)
    handleRentalOfferCreated(event)
    assert.entityCount('RentalOffer', 0)
  })
})
