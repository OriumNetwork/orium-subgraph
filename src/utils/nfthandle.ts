import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Account, Nft } from "../../generated/schema";

export class NftHandle {
  type: string;
  state: string;
  platform: string;

  constructor(type: string, state: string, platform: string) {
    this.type = type;
    this.state = state;
    this.platform = platform;
  }

  public handle(
    event: ethereum.Event,
    from: string,
    to: string,
    tokenId: BigInt,
    id: string
  ): void {
    let entity = Nft.load(id);
    if (!entity) {
      entity = new Nft(id);
      entity.type = this.type;
      entity.state = this.state;
      entity.platform = this.platform;
      entity.tokenId = tokenId;
      entity.address = event.address.toHexString().toLowerCase();
    }

    let toAccount = Account.load(to);
    if (!toAccount) {
      toAccount = new Account(to);
      toAccount.save();
    }

    let fromAccount = Account.load(from);
    if (!fromAccount) {
      fromAccount = new Account(from);
      fromAccount.save();
    }

    entity.currentOwner = toAccount.id;
    entity.previousOwner = fromAccount.id;
    entity.originalOwner = toAccount.id;
    entity.lastOfferExpirationAt = BigInt.zero();
    entity.save();
  }
}
