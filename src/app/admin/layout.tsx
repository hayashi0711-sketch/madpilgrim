import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
        <nav className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/admin">MAD Pilgrim Admin</Link>
          <Link href="/admin/spots" className="text-zinc-600 hover:text-black">スポット管理</Link>
          <Link href="/admin/spots/new" className="text-zinc-600 hover:text-black">新規追加</Link>
          <Link href="/admin/copy" className="text-zinc-600 hover:text-black">サイト文言</Link>
          <Link href="/admin/design" className="text-zinc-600 hover:text-black">デザイン設定</Link>
        </nav>
        <form action={logoutAction}>
          <button className="text-sm text-zinc-500 hover:text-black" type="submit">ログアウト</button>
        </form>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
