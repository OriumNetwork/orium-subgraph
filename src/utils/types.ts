export class ComethNFT {
  token: string;
  tokenId: string;
  duration: string;
  basisPoints: string;
}

export enum ActionRight {
  CHANNELING,
  EMPTY_RESERVOIR,
  EQUIP_INSTALLATIONS,
  EQUIP_TILES,
  UNEQUIP_INSTALLATIONS,
  UNEQUIP_TILES,
  UPGRADE_INSTALLATIONS
}

export enum AccessRight {
  ONLY_OWNER,
  OWNER_AND_LENT_OUT,
  WHITELISTED_ONLY,
  ALLOW_BLACKLISTED,
  ANYONE
}