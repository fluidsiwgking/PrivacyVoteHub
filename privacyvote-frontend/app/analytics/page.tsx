"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ethers } from "ethers";
import dynamic from "next/dynamic";
const Pie = dynamic(()=> import("react-chartjs-2").then(m=>m.Pie), { ssr:false });
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
import { PrivacyVoteHubABI } from "@/abi/PrivacyVoteHubABI";
import { PrivacyVoteHubAddresses } from "@/abi/PrivacyVoteHubAddresses";
import { decryptAggregate } from "@/fhevm/adapter";

export default function AnalyticsPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | undefined>();
  const [topicId, setTopicId] = useState<number | null>(null);
  const [info, setInfo] = useState<any | null>(null);
  const [encAgg, setEncAgg] = useState<string[] | null>(null);
  const [clear, setClear] = useState<Record<string, bigint> | null>(null);
  const [msg, setMsg] = useState("");

  const addr = useMemo(()=> chainId ? (PrivacyVoteHubAddresses as any)[String(chainId)]?.address : null, [chainId]);
  const contract = useMemo(()=> (addr && provider)? new ethers.Contract(addr, PrivacyVoteHubABI.abi, provider) : null, [addr, provider]);

  useEffect(()=>{(async()=>{ if(!window?.ethereum) return; const bp=new ethers.BrowserProvider(window.ethereum); setProvider(bp); const net=await bp.getNetwork(); setChainId(Number(net.chainId)); try{ setSigner(await bp.getSigner()); }catch{} })();},[]);

  const loadTopic = useCallback(async (id:number) => {
    if (!contract) return;
    try {
      const t = await (contract as any).getTopic(id); setInfo({ name: t[0], options: t[2] });
      const enc = await (contract as any).getEncryptedAggregate(id); setEncAgg(enc);
      setTopicId(id); setClear(null); setMsg("");
    } catch(e:any){ setMsg(`加载失败: ${e?.message||'未知错误'}`); }
  }, [contract]);

  const decrypt = useCallback(async ()=>{
    if (!addr || !encAgg || !signer || !chainId || !provider) return;
    const res = await decryptAggregate({ contractAddress: addr, encHandles: encAgg, userAddress: await signer.getAddress(), chainId, provider });
    setClear(res as unknown as Record<string, bigint>);
  }, [addr, encAgg, signer, chainId, provider]);

  const pie = useMemo(()=>{
    if (!info || !encAgg || !clear) return null;
    return {
      labels: info.options,
      datasets: [{ data: encAgg.map(h=> Number((clear as any)[h]||0)), backgroundColor: ["#36f1b8", "#00e6a8", "#4ade80", "#60a5fa", "#f59e0b", "#ef4444"] }]
    };
  }, [info, encAgg, clear]);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-neon-500">统计分析</h1>
        <div className="mt-4 flex gap-2">
          <input type="number" className="input" placeholder="输入议题ID" onChange={e=>setTopicId(Number(e.target.value)||0)} />
          <button className="btn-outline" onClick={()=> topicId && loadTopic(topicId)}>加载</button>
          <button className="btn-primary" onClick={decrypt} disabled={!encAgg}>解密累计</button>
        </div>
      </div>

      {pie && (
        <div className="card">
          {/* @ts-ignore */}
          <Pie data={pie} />
        </div>
      )}

      {msg && <div className="card text-center"><p className="text-white/80 text-sm">{msg}</p></div>}
    </div>
  );
}


