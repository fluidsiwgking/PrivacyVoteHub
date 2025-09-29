export type FHEVMMetadata = {
  ACLAddress: `0x${string}`;
  InputVerifierAddress: `0x${string}`;
  KMSVerifierAddress: `0x${string}`;
};

export const PublicKeyStorage = {
  async get(): Promise<FHEVMMetadata> {
    return {
      ACLAddress: "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
      InputVerifierAddress: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
      KMSVerifierAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    } as const;
  },
};




