import { ethers } from "ethers";
import { fhevmMockCreateInstance } from "@/fhevm/internal/mock/fhevmMock";
import { PublicKeyStorage } from "@/fhevm/internal/PublicKeyStorage";

async function ensurePolyfills() {
  if (typeof globalThis.global === "undefined") {
    (globalThis as any).global = globalThis;
  }
  if (typeof (globalThis as any).Buffer === "undefined") {
    const { Buffer } = await import("buffer");
    (globalThis as any).Buffer = Buffer;
  }
}

export async function encryptOneHot(params: {
  contractAddress: `0x${string}`;
  userAddress: string;
  onehot: number[];
  chainId: number;
  provider: ethers.BrowserProvider;
}) {
  const { contractAddress, userAddress, onehot, chainId } = params;
  if (chainId === 31337) {
    const meta = await PublicKeyStorage.get();
    const inst = await fhevmMockCreateInstance({ rpcUrl: "http://localhost:8545", chainId, metadata: meta });
    const input = inst.createEncryptedInput(contractAddress, userAddress);
    for (const v of onehot) input.add32(v);
    return await input.encrypt();
  } else {
    await ensurePolyfills();
    const { createInstance, SepoliaConfig, initSDK } = await import("@zama-fhe/relayer-sdk/web");
    await initSDK();
    const useRelayer = chainId === 11155111;
    let client: any;
    if (useRelayer) {
      // 通过自建 API 路由先取回 key/params，再传入 SDK，避免直连失败
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const resp = await fetch(`${base}/api/relayer-keys`, { cache: "no-store" });
      if (!resp.ok) throw new Error(`fetch relayer keys failed: ${resp.status}`);
      const j = await resp.json();
      client = await createInstance({
        aclContractAddress: SepoliaConfig.aclContractAddress,
        kmsContractAddress: SepoliaConfig.kmsContractAddress,
        inputVerifierContractAddress: SepoliaConfig.inputVerifierContractAddress,
        verifyingContractAddressDecryption: SepoliaConfig.verifyingContractAddressDecryption,
        verifyingContractAddressInputVerification: SepoliaConfig.verifyingContractAddressInputVerification,
        relayerUrl: SepoliaConfig.relayerUrl,
        chainId: 11155111,
        gatewayChainId: SepoliaConfig.gatewayChainId,
        network: SepoliaConfig.network,
        publicKey: {
          id: j.publicKeyId,
          data: Uint8Array.from(Buffer.from(j.publicKeyB64, "base64")),
        },
        publicParams: {
          2048: {
            publicParams: Uint8Array.from(Buffer.from(j.publicParams2048B64, "base64")),
            publicParamsId: j.publicParamsId,
          },
        },
      });
    } else {
      client = await createInstance({ mode: "default" });
    }
    const input = client.createEncryptedInput(contractAddress, userAddress);
    for (const v of onehot) input.add32(v);
    return await input.encrypt();
  }
}

export async function decryptAggregate(params: {
  contractAddress: `0x${string}`;
  encHandles: string[];
  userAddress: string;
  chainId: number;
  provider: ethers.BrowserProvider;
}) {
  const { contractAddress, encHandles, userAddress, chainId } = params;
  const now = Math.floor(Date.now() / 1000);
  const days = 365;

  if (chainId === 31337) {
    const meta = await PublicKeyStorage.get();
    const inst = await fhevmMockCreateInstance({ rpcUrl: "http://localhost:8545", chainId, metadata: meta });
    const { publicKey, privateKey } = inst.generateKeypair();
    const eip = inst.createEIP712(publicKey, [contractAddress], now, days);
    const signer = await params.provider.getSigner();
    const signature = await (signer as any).signTypedData(
      eip.domain,
      { UserDecryptRequestVerification: eip.types.UserDecryptRequestVerification },
      eip.message
    );
    const items = encHandles.map((h) => ({ handle: h, contractAddress }));
    return await inst.userDecrypt(
      items,
      privateKey,
      publicKey,
      signature,
      [contractAddress],
      (await signer.getAddress()) as `0x${string}`,
      now,
      days
    );
  } else {
    await ensurePolyfills();
    const { createInstance, SepoliaConfig, initSDK } = await import("@zama-fhe/relayer-sdk/web");
    await initSDK();
    const useRelayer = chainId === 11155111;
    let client: any;
    if (useRelayer) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const resp = await fetch(`${base}/api/relayer-keys`, { cache: "no-store" });
      if (!resp.ok) throw new Error(`fetch relayer keys failed: ${resp.status}`);
      const j = await resp.json();
      client = await createInstance({
        aclContractAddress: SepoliaConfig.aclContractAddress,
        kmsContractAddress: SepoliaConfig.kmsContractAddress,
        inputVerifierContractAddress: SepoliaConfig.inputVerifierContractAddress,
        verifyingContractAddressDecryption: SepoliaConfig.verifyingContractAddressDecryption,
        verifyingContractAddressInputVerification: SepoliaConfig.verifyingContractAddressInputVerification,
        relayerUrl: SepoliaConfig.relayerUrl,
        chainId: 11155111,
        gatewayChainId: SepoliaConfig.gatewayChainId,
        network: SepoliaConfig.network,
        publicKey: {
          id: j.publicKeyId,
          data: Uint8Array.from(Buffer.from(j.publicKeyB64, "base64")),
        },
        publicParams: {
          2048: {
            publicParams: Uint8Array.from(Buffer.from(j.publicParams2048B64, "base64")),
            publicParamsId: j.publicParamsId,
          },
        },
      });
    } else {
      client = await createInstance({ mode: "default" });
    }
    const { publicKey, privateKey } = client.generateKeypair();
    const eip = client.createEIP712(publicKey, [contractAddress], now, days);
    const signer = await params.provider.getSigner();
    const signature = await (signer as any).signTypedData(
      eip.domain,
      { UserDecryptRequestVerification: eip.types.UserDecryptRequestVerification },
      eip.message
    );
    const items = encHandles.map((h) => ({ handle: h, contractAddress }));
    return await client.userDecrypt(
      items,
      privateKey,
      publicKey,
      signature,
      [contractAddress],
      (await signer.getAddress()) as `0x${string}`,
      now,
      days
    );
  }
}
