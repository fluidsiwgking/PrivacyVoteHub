import { NextResponse } from "next/server";

export async function GET() {
  try {
    const base = "https://relayer.testnet.zama.cloud";
    const keyurlRes = await fetch(`${base}/v1/keyurl`, { cache: "no-store" });
    if (!keyurlRes.ok) {
      return NextResponse.json({ error: `keyurl status ${keyurlRes.status}` }, { status: 502 });
    }
    const data = await keyurlRes.json();
    const info = data?.response?.fhe_key_info?.[0];
    const crsInfo = data?.response?.crs?.["2048"];
    if (!info || !crsInfo) {
      return NextResponse.json({ error: "unexpected relayer response" }, { status: 500 });
    }

    const publicKeyId: string = info.fhe_public_key?.data_id;
    const publicKeyUrl: string = info.fhe_public_key?.urls?.[0];
    const publicParamsId: string = crsInfo?.data_id;
    const publicParamsUrl: string = crsInfo?.urls?.[0];

    if (!publicKeyId || !publicKeyUrl || !publicParamsId || !publicParamsUrl) {
      return NextResponse.json({ error: "missing key urls" }, { status: 500 });
    }

    const [pkRes, crsRes] = await Promise.all([
      fetch(publicKeyUrl, { cache: "no-store" }),
      fetch(publicParamsUrl, { cache: "no-store" }),
    ]);
    if (!pkRes.ok || !crsRes.ok) {
      return NextResponse.json({ error: `key fetch failed ${pkRes.status}/${crsRes.status}` }, { status: 502 });
    }

    const pkBuf = new Uint8Array(await pkRes.arrayBuffer());
    const crsBuf = new Uint8Array(await crsRes.arrayBuffer());

    return NextResponse.json({
      publicKeyId,
      publicKeyB64: Buffer.from(pkBuf).toString("base64"),
      publicParamsId,
      publicParams2048B64: Buffer.from(crsBuf).toString("base64"),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}




