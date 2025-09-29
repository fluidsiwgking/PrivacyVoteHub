"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import { PrivacyVoteHubABI } from "@/abi/PrivacyVoteHubABI";
import { PrivacyVoteHubAddresses } from "@/abi/PrivacyVoteHubAddresses";
import { encryptOneHot } from "@/fhevm/adapter";

export function generateStaticParams() { return []; }
export const dynamic = "force-static";

export default function TopicDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | undefined>();
  const [info, setInfo] = useState<any | null>(null);
  const [selected, setSelected] = useState(0);
  const [msg, setMsg] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const contract = useMemo(() => {
    if (!provider || !chainId) return null;
    const addr = (PrivacyVoteHubAddresses as any)[String(chainId)]?.address;
    if (!addr) return null;
    return new ethers.Contract(addr, PrivacyVoteHubABI.abi, provider);
  }, [provider, chainId]);

  useEffect(() => {
    (async () => {
      if (!window?.ethereum) return;
      const bp = new ethers.BrowserProvider(window.ethereum);
      setProvider(bp);
      const net = await bp.getNetwork(); setChainId(Number(net.chainId));
      try { setSigner(await bp.getSigner()); } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!contract || !id) return;
      const t = await (contract as any).getTopic(id);
      const status = await (contract as any).getTopicStatus(id);
      setInfo({
        id,
        name: t[0], details: t[1], options: t[2], openAt: Number(t[3]), closeAt: Number(t[4]), published: t[5], owner: t[6], status: Number(status)
      });
    })();
  }, [contract, id]);

  const voteOneHot = useCallback(async () => {
    if (!provider || !chainId || !signer || !info) return;
    setIsVoting(true); setMsg("正在提交投票...");
    try {
      const addr = (PrivacyVoteHubAddresses as any)[String(chainId)]?.address; if(!addr) return;
      const onehot = new Array(info.options.length).fill(0).map((_:any,i:number)=> i===selected?1:0);
      const enc = await encryptOneHot({ contractAddress: addr, userAddress: await signer.getAddress(), onehot, chainId, provider });
      const withSigner = new ethers.Contract(addr, PrivacyVoteHubABI.abi, provider).connect(signer);
      const tx = await (withSigner as any).submitCipherOneHot(id, enc.handles, enc.inputProof);
      const r = await tx.wait(); setMsg(`投票成功！交易哈希: ${r?.hash}`);
    } catch (e:any) {
      setMsg(`投票失败: ${e?.message || '未知错误'}`);
    } finally { setIsVoting(false); }
  }, [provider, chainId, signer, info, selected, id]);

  const fmt = (t:number)=> new Date(t*1000).toLocaleString('zh-CN');
  if (!info) return <div className="text-center py-16 text-white/70">加载中...</div>;

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-neon-500">{info.name}</h1>
          <span className="px-3 py-1 rounded-full text-xs border border-neon-500 text-neon-400">
            {info.status===1? '进行中' : info.status===0? '未开始' : info.status>=2? '已结束' : '—'}
          </span>
        </div>
        {info.details && <p className="text-white/70 mb-4">{info.details}</p>}
        <div className="flex flex-wrap gap-4 text-sm text-white/60">
          <span>开始于 {fmt(info.openAt)}</span>
          <span>结束于 {fmt(info.closeAt)}</span>
          <span className="font-mono">创建者 {info.owner.slice(0,6)}...{info.owner.slice(-4)}</span>
        </div>
      </div>

      {info.status===1 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">请选择您的投票</h2>
          <div className="space-y-3 mb-6">
            {info.options.map((o:string, i:number)=> (
              <label key={i} className={`block p-4 rounded-xl border-2 cursor-pointer ${selected===i? 'border-neon-500 bg-white/5' : 'border-white/10 hover:border-neon-500/40'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" checked={selected===i} onChange={()=>setSelected(i)} className="w-5 h-5 text-neon-500" />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selected===i? 'bg-neon-500 text-night-900' : 'bg-white/10 text-white/70'}`}>{String.fromCharCode(65+i)}</div>
                  <span className="font-medium">{o}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={voteOneHot} disabled={isVoting}>{isVoting? '投票中...' : '投票（同态聚合）'}</button>
          </div>
        </div>
      )}

      {msg && <div className="card text-center"><p className="text-white/80 text-sm">{msg}</p></div>}
    </div>
  );
}


