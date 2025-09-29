"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold"><span className="text-neon-500">Privacy</span>VoteHub</h1>
        <p className="text-white/70">同态加密 · 私密投票 · 霓虹暗黑风格</p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/create" className="btn-primary">创建议题</Link>
          <Link href="/topics" className="btn-outline">浏览议题</Link>
          <Link href="/analytics" className="btn-outline">统计分析</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-neon-500 mb-2">私密</div>
          <p className="text-white/70 text-sm">基于 FHEVM 的端到端加密，投票内容仅以密文存在</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-neon-500 mb-2">可证</div>
          <p className="text-white/70 text-sm">链上过程可验证，结果可信可审计</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-neon-500 mb-2">优雅</div>
          <p className="text-white/70 text-sm">全新霓虹暗黑设计语言，沉浸式体验</p>
        </div>
      </div>
    </div>
  );
}




