"use client";

import Image from "next/image";

type SpotFormInitial = {
  slug?: string;
  title?: string;
  title_en?: string | null;
  category?: string;
  spot_name?: string;
  spot_name_en?: string | null;
  prefecture?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description_ja?: string | null;
  description_en?: string | null;
  visit_tips_ja?: string | null;
  visit_tips_en?: string | null;
  scene_timestamp?: string | null;
  scene_number?: string | null;
  broadcaster?: string | null;
  release_year?: number | null;
  youtube_url?: string | null;
  youtube_channel_name?: string | null;
  status?: string;
  is_featured?: boolean | null;
  food_image_type?: string | null;
};

const categories = [
  { value: "anime", label: "アニメ" },
  { value: "drama", label: "ドラマ" },
  { value: "movie", label: "映画" },
  { value: "mv", label: "Music Video" },
  { value: "cm", label: "CM" },
  { value: "manga", label: "マンガ" }
];

const statuses = [
  { value: "approved", label: "公開（承認済み）" },
  { value: "ai_suggested", label: "確認待ち" },
  { value: "hidden", label: "非公開" },
  { value: "unverified", label: "未検証" }
];

const foodImageTypes = [
  { value: "washoku", label: "和食" },
  { value: "yoshoku", label: "洋食" },
  { value: "chuka", label: "中華" },
  { value: "sweets", label: "スイーツ" },
  { value: "gourmet", label: "グルメ全般" },
  { value: "location", label: "撮影場所" }
];

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm";

export function SpotForm({
  action,
  initial,
  spotId,
  submitLabel,
  extraHidden
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: SpotFormInitial;
  spotId?: string;
  submitLabel: string;
  extraHidden?: Record<string, string>;
}) {
  return (
    <form action={action} className="mt-6 space-y-5">
      {spotId ? <input name="id" type="hidden" value={spotId} /> : null}
      {extraHidden
        ? Object.entries(extraHidden).map(([key, value]) => <input key={key} name={key} type="hidden" value={value} />)
        : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="スラッグ（URL用、新規作成時のみ編集可）">
          <input className={inputClass} defaultValue={initial?.slug} disabled={Boolean(spotId)} name="slug" required type="text" />
        </Field>
        <Field label="カテゴリ">
          <select className={inputClass} defaultValue={initial?.category || "drama"} name="category" required>
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">「作品に出た味」のイメージ写真</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {foodImageTypes.map((item) => (
            <label className="cursor-pointer rounded-md border border-black/15 p-2 text-sm has-[:checked]:border-black has-[:checked]:ring-1 has-[:checked]:ring-black" key={item.value}>
              <Image
                alt={item.label}
                className="aspect-[4/3] w-full rounded object-cover"
                height={120}
                src={`/images/food-types/${item.value}.jpg`}
                width={160}
              />
              <span className="mt-2 flex items-center gap-2">
                <input defaultChecked={initial?.food_image_type === item.value} name="food_image_type" type="radio" value={item.value} />
                {item.label}
              </span>
            </label>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
          <input defaultChecked={!initial?.food_image_type} name="food_image_type" type="radio" value="" />
          未選択（既定画像を使用）
        </label>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="作品名（日本語）">
          <input className={inputClass} defaultValue={initial?.title} name="title" required type="text" />
        </Field>
        <Field label="作品名（英語）">
          <input className={inputClass} defaultValue={initial?.title_en ?? ""} name="title_en" type="text" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="スポット名（日本語）">
          <input className={inputClass} defaultValue={initial?.spot_name} name="spot_name" required type="text" />
        </Field>
        <Field label="スポット名（英語）">
          <input className={inputClass} defaultValue={initial?.spot_name_en ?? ""} name="spot_name_en" type="text" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="都道府県">
          <input className={inputClass} defaultValue={initial?.prefecture ?? ""} name="prefecture" type="text" />
        </Field>
        <Field label="市区町村">
          <input className={inputClass} defaultValue={initial?.city ?? ""} name="city" type="text" />
        </Field>
        <Field label="緯度 (latitude)">
          <input className={inputClass} defaultValue={initial?.latitude ?? ""} name="latitude" required step="any" type="number" />
        </Field>
        <Field label="経度 (longitude)">
          <input className={inputClass} defaultValue={initial?.longitude ?? ""} name="longitude" required step="any" type="number" />
        </Field>
      </div>

      <Field label="説明（日本語）">
        <textarea className={inputClass} defaultValue={initial?.description_ja ?? ""} name="description_ja" rows={3} />
      </Field>
      <Field label="説明（英語）">
        <textarea className={inputClass} defaultValue={initial?.description_en ?? ""} name="description_en" rows={3} />
      </Field>
      <Field label="訪問のヒント（日本語）">
        <textarea className={inputClass} defaultValue={initial?.visit_tips_ja ?? ""} name="visit_tips_ja" rows={2} />
      </Field>
      <Field label="訪問のヒント（英語）">
        <textarea className={inputClass} defaultValue={initial?.visit_tips_en ?? ""} name="visit_tips_en" rows={2} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="シーンタイムスタンプ">
          <input className={inputClass} defaultValue={initial?.scene_timestamp ?? ""} name="scene_timestamp" type="text" />
        </Field>
        <Field label="シーン番号">
          <input className={inputClass} defaultValue={initial?.scene_number ?? ""} name="scene_number" type="text" />
        </Field>
        <Field label="公開年">
          <input className={inputClass} defaultValue={initial?.release_year ?? ""} name="release_year" type="number" />
        </Field>
      </div>

      <Field label="放送局 / アーティスト名（broadcaster）">
        <input className={inputClass} defaultValue={initial?.broadcaster ?? ""} name="broadcaster" type="text" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="YouTube URL（公式チャンネルで確認したもののみ）">
          <input className={inputClass} defaultValue={initial?.youtube_url ?? ""} name="youtube_url" type="url" />
        </Field>
        <Field label="YouTubeチャンネル名">
          <input className={inputClass} defaultValue={initial?.youtube_channel_name ?? ""} name="youtube_channel_name" type="text" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="公開状態">
          <select className={inputClass} defaultValue={initial?.status || "approved"} name="status">
            {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
          <input defaultChecked={Boolean(initial?.is_featured)} name="is_featured" type="checkbox" />
          トップページの「おすすめ」に表示する
        </label>
      </div>

      <button className="rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
