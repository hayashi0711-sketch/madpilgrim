import { loginAction } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form action={loginAction} className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-bold">MAD Pilgrim 管理画面</h1>
        <p className="mt-1 text-sm text-zinc-500">パスワードを入力してください。</p>
        {error ? <p className="mt-3 text-sm text-red-600">パスワードが正しくありません。</p> : null}
        <input
          autoFocus
          className="mt-4 w-full rounded-md border border-black/15 px-3 py-2.5 text-sm"
          name="password"
          placeholder="Password"
          required
          type="password"
        />
        <button
          className="mt-4 w-full rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          type="submit"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
