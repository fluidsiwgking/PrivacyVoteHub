"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { PrivacyVoteHubABI } from "@/abi/PrivacyVoteHubABI";
import { PrivacyVoteHubAddresses } from "@/abi/PrivacyVoteHubAddresses";
const loadMock = () => import("@/fhevm/internal/mock/fhevmMock");
import { PublicKeyStorage } from "@/fhevm/internal/PublicKeyStorage";

export default function CreateTopic() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | undefined>();
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [options, setOptions] = useState<string[]>(["选项A", "选项B"]);
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!window?.ethereum) return;
      const bp = new ethers.BrowserProvider(window.ethereum);
      setProvider(bp);
      const net = await bp.getNetwork(); setChainId(Number(net.chainId));
      try { setSigner(await bp.getSigner()); } catch {}
      const now = Math.floor(Date.now()/1000); setStart(now+60); setEnd(now+3600);
    })();
  }, []);

  const contract = useMemo(() => {
    if (!provider || !chainId || !signer) return null;
    const addr = (PrivacyVoteHubAddresses as any)[String(chainId)]?.address;
    if (!addr) return null;
    return new ethers.Contract(addr, PrivacyVoteHubABI.abi, signer);
  }, [provider, chainId, signer]);

  const addOption = () => setOptions([...options, `选项${String.fromCharCode(65+options.length)}`]);
  const delOption = (i: number) => options.length>2 && setOptions(options.filter((_,idx)=>idx!==i));
  const updOption = (i: number, v: string) => setOptions(options.map((o,idx)=> idx===i? v : o));

  const tsToLocal = (t:number|null)=>{ if(!t) return ""; const d=new Date(t*1000); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); const hh=String(d.getHours()).padStart(2,'0'); const mm=String(d.getMinutes()).padStart(2,'0'); return `${y}-${m}-${day}T${hh}:${mm}`; };
  const localToTs = (s:string)=> Math.floor(new Date(s).getTime()/1000);

  const create = useCallback(async () => {
    if (!contract || !name.trim() || options.some(o=>!o.trim()) || start===null || end===null) {
      setMsg("请填写完整信息"); return;
    }
    setIsLoading(true); setMsg("正在创建议题...");
    try {
      const tx = await (contract as any).createTopic(name.trim(), details.trim(), options.map(o=>o.trim()), BigInt(start), BigInt(end), 1);
      setMsg("交易已提交，等待确认..."); const r = await tx.wait(); setMsg(`创建成功！交易哈希: ${r?.hash}`);
    } catch (e:any) {
      setMsg(`创建失败: ${e?.message || '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  }, [contract, name, details, options, start, end]);

  // 示例：同态加密调用（one-hot 提交）
  const submitOneHotDemo = useCallback(async (topicId: number, selectedIndex: number) => {
    if (!provider || !chainId || !signer) return;
    const addr = (PrivacyVoteHubAddresses as any)[String(chainId)]?.address;
    if (!addr) return;
    const contractRO = new ethers.Contract(addr, PrivacyVoteHubABI.abi, provider);
    const withSigner = contractRO.connect(signer);
    const mod = await loadMock();
    const meta = await PublicKeyStorage.get();
    const inst = await (mod as any).fhevmMockCreateInstance({ rpcUrl: "http://localhost:8545", chainId, metadata: meta });
    const input = inst.createEncryptedInput(addr, (await signer.getAddress()));
    const onehot = new Array(options.length).fill(0).map((_,i)=> i===selectedIndex?1:0);
    for (const v of onehot) input.add32(v);
    const enc = await input.encrypt();
    await (withSigner as any).submitCipherOneHot(topicId, enc.handles, enc.inputProof);
  }, [provider, chainId, signer, options.length]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neon-500">创建议题</h1>
        <p className="text-white/70">设置名称、描述、选项和时间窗口</p>
      </div>
      <div className="card space-y-6">
        <div>
          <label className="block mb-2 text-white/70">议题名称 *</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="请输入名称" />
        </div>
        <div>
          <label className="block mb-2 text-white/70">议题描述</label>
          <textarea className="input" rows={3} value={details} onChange={e=>setDetails(e.target.value)} placeholder="可选" />
        </div>
        <div>
          <label className="block mb-2 text-white/70">投票选项 *</label>
          <div className="space-y-3">
            {options.map((o,i)=> (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-500 text-night-900 flex items-center justify-center font-bold">{String.fromCharCode(65+i)}</div>
                <input className="input flex-1" value={o} onChange={e=>updOption(i, e.target.value)} placeholder={`选项 ${String.fromCharCode(65+i)}`} />
                {options.length>2 && <button className="btn-outline" onClick={()=>delOption(i)}>删除</button>}
              </div>
            ))}
          </div>
          {options.length<10 && <button className="btn-outline mt-3" onClick={addOption}>添加选项</button>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-white/70">开始时间</label>
            <input type="datetime-local" className="input" value={tsToLocal(start)} onChange={e=>setStart(localToTs(e.target.value))} />
          </div>
          <div>
            <label className="block mb-2 text-white/70">结束时间</label>
            <input type="datetime-local" className="input" value={tsToLocal(end)} onChange={e=>setEnd(localToTs(e.target.value))} />
          </div>
        </div>
        <div>
          <button className="btn-primary w-full" onClick={create} disabled={isLoading}>{isLoading? '创建中...' : '创建议题'}</button>
        </div>
      </div>
      {msg && <div className="card text-center"><p className="text-white/80 text-sm">{msg}</p></div>}
    </div>
  );
}


