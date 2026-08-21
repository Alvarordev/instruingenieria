<script>
  import ImageUploader from "./ImageUploader.svelte";
  import { slugify } from "../../lib/slugify";

  let { brand = null } = $props();

  let name = $state(brand?.name ?? "");
  let logoUrl = $state(brand?.logoUrl ?? null);
  let saving = $state(false);
  let error = $state("");

  async function handleSubmit(event) {
    event.preventDefault();
    saving = true;
    error = "";

    const body = {
      name,
      logoUrl,
      ...(brand ? {} : { slug: slugify(name) }),
    };

    const url = brand ? `/api/admin/brands/${brand.id}` : "/api/admin/brands";
    const method = brand ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    saving = false;

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error = data.error ?? "No se pudo guardar la marca";
      return;
    }

    window.location.href = "/admin/marcas";
  }
</script>

<form onsubmit={handleSubmit} class="brand-form flex max-w-xl flex-col gap-5">
  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Nombre
    <input type="text" bind:value={name} required class="rounded-md border border-black/20 px-3 py-2 text-sm" />
  </label>

  <div class="flex flex-col gap-1 text-sm font-medium text-black">
    Logo
    <ImageUploader bind:value={logoUrl} />
  </div>

  {#if error}<p class="error text-sm text-red-600">{error}</p>{/if}

  <button
    type="submit"
    disabled={saving}
    class="self-start rounded-pill bg-brand-blue px-6 py-2.5 text-sm font-bold uppercase text-white hover:bg-sky-600 disabled:opacity-60"
  >
    {saving ? "Guardando…" : "Guardar"}
  </button>
</form>
