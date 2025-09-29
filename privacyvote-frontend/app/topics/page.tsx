"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { PrivacyVoteHubABI } from "@/abi/PrivacyVoteHubABI";
import { PrivacyVoteHubAddresses } from "@/abi/PrivacyVoteHubAddresses";

export default function TopicsPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | undefined>();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!contract) return;
      setLoading(true);
      try {
        const c = Number(await (contract as any).getTopicCount());
        setCount(c);
        const arr:any[] = [];
        for (let i=1;i<=c;i++) {
          const [name, details, options, openAt, closeAt, published, owner] = await (contract as any).getTopic(i);
          const status = await (contract as any).getTopicStatus(i);
          arr.push({ id:i, name, details, options, openAt: Number(openAt), closeAt: Number(closeAt), published, owner, status:Number(status) });
        }
        arr.reverse(); setItems(arr);
      } finally { setLoading(false); }
    })();
  }, [contract]);

  const fmt = (t:number)=> new Date(t*1000).toLocaleString('zh-CN');

  if (loading) return <div className="text-center py-16 text-white/70">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neon-500">议题列表</h1>
        <p className="text-white/60">共 {count} 个议题</p>
      </div>
      {count===0 ? (
        <div className="card text-center">
          <p className="text-white/70">暂无议题，去创建一个吧。</p>
          <div className="mt-4"><Link href="/create" className="btn-primary">创建议题</Link></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map(t => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/topics/${t.id}`} className="text-xl font-semibold text-neon-500 hover:underline">{t.name}</Link>
                    <span className="px-3 py-1 rounded-full text-xs border border-neon-500 text-neon-400">
                      {t.status===1? '进行中' : t.status===0? '未开始' : t.status>=2? '已结束' : '—'}
                    </span>
                  </div>
                  {t.details && <p className="text-white/70 mb-3 line-clamp-2">{t.details}</p>}
                  <div className="flex flex-wrap gap-3 text-sm text-white/60">
                    <span>结束于 {fmt(t.closeAt)}</span>
                    <span>选项数 {t.options.length}</span>
                    <span className="font-mono">创建者 {t.owner.slice(0,6)}...{t.owner.slice(-4)}</span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <Link href={`/topics/${t.id}`} className="btn-outline">查看详情</Link>
                  {t.status>=2 && <Link href={`/results/${t.id}`} className="btn-primary">查看结果</Link>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




