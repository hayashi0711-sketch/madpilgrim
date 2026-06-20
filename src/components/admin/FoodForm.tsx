"use client";

type FoodFormInitial = {
  spot_id?: string | null;
  name?: string;
  dish_name?: string | null;
  category?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  price_level?: number | null;
  description_ja?: string | null;
  description_en?: string | null;
  tags?: string[] | null;
  google_maps_url?: string | null;
  website_url?: string | null;
  is_sponsored?: boolean | null;
};

type SpotOption = {
  id: string;
  title: string;
};

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

export function FoodForm({
  action,
  foodId,
  initial,
  spots,
  submitLabel
}: {
  action: (formData: FormData) => void | Promise<void>;
  foodId?: string;
  initial?: FoodFormInitial;
  spots: SpotOption[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-6 space-y-5">
      {foodId ? <input name="id" type="hidden" value={foodId} /> : null}

      <Field label="紐づく作品">
        <select className={inputClass} defaultValue={initial?.spot_id ?? ""} name="spot_id" required>
          <option disabled value="">作品を選択してください</option>
          {spots.map((spot) => (
            <option key={spot.id} value={spot.id}>{spot.title}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="店舗名">
          <input className={inputClass} defaultValue={initial?.name ?? ""} name="name" required type="text" />
        </Field>
        <Field label="おすすめ（料理名）">
          <input className={inputClass} defaultValue={initial?.dish_name ?? ""} name="dish_name" type="text" />
        </Field>
      </div>

      <Field label="カテゴリ">
        <input className={inputClass} defaultValue={initial?.category ?? ""} name="category" type="text" />
      </Field>

      <Field label="住所">
        <input className={inputClass} defaultValue={initial?.address ?? ""} name="address" type="text" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="緯度 (latitude)">
          <input className={inputClass} defaultValue={initial?.latitude ?? ""} name="latitude" step="any" type="number" />
        </Field>
        <Field label="経度 (longitude)">
          <input className={inputClass} defaultValue={initial?.longitude ?? ""} name="longitude" step="any" type="number" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="評価">
          <input className={inputClass} defaultValue={initial?.rating ?? ""} name="rating" step="any" type="number" />
        </Field>
        <Field label="価格帯">
          <input className={inputClass} defaultValue={initial?.price_level ?? ""} name="price_level" step="1" type="number" />
        </Field>
      </div>

      <Field label="説明（日本語）">
        <textarea className={inputClass} defaultValue={initial?.description_ja ?? ""} name="description_ja" rows={3} />
      </Field>
      <Field label="説明（英語）">
        <textarea className={inputClass} defaultValue={initial?.description_en ?? ""} name="description_en" rows={3} />
      </Field>

      <Field label="タグ（カンマ区切り）">
        <input className={inputClass} defaultValue={(initial?.tags ?? []).join(", ")} name="tags" type="text" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="GoogleマップURL">
          <input className={inputClass} defaultValue={initial?.google_maps_url ?? ""} name="google_maps_url" type="url" />
        </Field>
        <Field label="店舗のホームページURL">
          <input className={inputClass} defaultValue={initial?.website_url ?? ""} name="website_url" type="url" />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input defaultChecked={Boolean(initial?.is_sponsored)} name="is_sponsored" type="checkbox" />
        スポンサー表示
      </label>

      <button className="rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
