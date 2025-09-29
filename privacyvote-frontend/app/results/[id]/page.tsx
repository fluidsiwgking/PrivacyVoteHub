"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import dynamic from "next/dynamic";
const Bar = dynamic(() => import("react-chartjs-2").then(m=>m.Bar), { ssr:false });
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
import { PrivacyVoteHubABI } from "@/abi/PrivacyVoteHubABI";
import { PrivacyVoteHubAddresses } from "@/abi/PrivacyVoteHubAddresses";
import { decryptAggregate } from "@/fhevm/adapter";

export function generateStaticParams() { return []; }
export const dynamic = "force-static";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | undefined>();
  const [info, setInfo] = useState<any | null>(null);
  const [encAgg, setEncAgg] = useState<string[] | null>(null);
  const [clear, setClear] = useState<Record<string, bigint> | null>(null);
  const [msg, setMsg] = useState("");
  const [decrypting, setDecrypting] = useState(false);

  const addr = useMemo(()=> chainId ? (PrivacyVoteHubAddresses as any)[String(chainId)]?.address : null, [chainId]);
  const contract = useMemo(()=> (addr && provider) ? new ethers.Contract(addr, PrivacyVoteHubABI.abi, provider) : null, [addr, provider]);

  useEffect(()=>{(async()=>{ if(!window?.ethereum) return; const bp=new ethers.BrowserProvider(window.ethereum); setProvider(bp); const net=await bp.getNetwork(); setChainId(Number(net.chainId)); try{ setSigner(await bp.getSigner()); }catch{} })();},[]);

  useEffect(()=>{(async()=>{ if(!contract||!id) return; const t=await (contract as any).getTopic(id); setInfo({ title:t[0], options:t[2] }); try{ const enc=await (contract as any).getEncryptedAggregate(id); setEncAgg(enc); }catch{} })();},[contract,id]);

  const decrypt = useCallback(async ()=>{
    if (!addr || !encAgg || !signer || !chainId || !provider) return;
    setDecrypting(true); setMsg("正在解密...");
    try {
      const res = await decryptAggregate({ contractAddress: addr, encHandles: encAgg, userAddress: await signer.getAddress(), chainId, provider });
      setClear(res as unknown as Record<string, bigint>);
      setMsg("解密成功！");
    } catch(e:any){ setMsg(`解密失败: ${e?.message||'未知错误'}`); } finally{ setDecrypting(false);} }, [addr, encAgg, signer, chainId, provider]);

  const data = useMemo(()=>{
    if (!info || !encAgg || !clear) return null;
    const labels = info.options.map((o:string)=>o);
    const values = encAgg.map(h=> Number((clear as any)[h]||0));
    return { labels, datasets: [{ label: "票数", data: values, backgroundColor: "#36f1b8"}] };
  }, [info, encAgg, clear]);

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-neon-500">{info?.title || '结果'}</h1>
        <p className="text-white/70">同态聚合结果展示</p>
      </div>

      {!clear && (
        <div className="card text-center">
          <p className="text-white/70 mb-4">检测到加密累计，点击下方按钮进行解密。</p>
          <button className="btn-primary" onClick={decrypt} disabled={decrypting}>{decrypting? '解密中...' : '解密累计结果'}</button>
        </div>
      )}

      {data && (
        <div className="card">
          {/* @ts-ignore */}
          <Bar data={data} />
        </div>
      )}

      {msg && <div className="card text-center"><p className="text-white/80 text-sm">{msg}</p></div>}
    </div>
  );
}


