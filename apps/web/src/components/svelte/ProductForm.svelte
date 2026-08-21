<script>
  import ImageUploader from "./ImageUploader.svelte";
  import { slugify } from "../../lib/slugify";

  let { product = null, categories = [], brands = [], defaultType = "venta" } = $props();

  let name = $state(product?.name ?? "");
  let tagline = $state(product?.tagline ?? "");
  let description = $state(product?.description ?? "");
  let specsText = $state((product?.specs ?? []).join("\n"));
  let applicationsText = $state((product?.applications ?? []).join("\n"));
  let categoryId = $state(product?.categoryId ?? "");
  let brandId = $state(product?.brandId ?? "");
  let type = $state(product?.type ?? defaultType);
  let price = $state(product?.price ?? "");
  let imageUrl = $state(product?.imageUrl ?? null);
  let fichaTecnicaUrl = $state(product?.fichaTecnicaUrl ?? "");
  let active = $state(product?.active ?? true);
  let saving = $state(false);
  let error = $state("");

  const topLevelCategories = categories.filter((c) => c.parentId === null);
  function leavesOf(parentId) {
    return categories.filter((c) => c.parentId === parentId);
  }

  function linesToArray(text) {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length ? lines : null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    saving = true;
    error = "";

    const body = {
      name,
      tagline: tagline || null,
      description,
      specs: linesToArray(specsText),
      applications: linesToArray(applicationsText),
      categoryId: Number(categoryId),
      brandId: brandId ? Number(brandId) : null,
      type,
      price: price === "" ? null : Number(price),
      imageUrl,
      fichaTecnicaUrl: fichaTecnicaUrl || null,
      active,
      ...(product ? {} : { slug: slugify(name) }),
    };

    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = product ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    saving = false;

    if (!res.ok) {
      error = "No se pudo guardar el producto";
      return;
    }

    window.location.href = "/admin/productos";
  }
</script>

<form onsubmit={handleSubmit} class="product-form flex max-w-2xl flex-col gap-5">
  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Nombre
    <input type="text" bind:value={name} required class="rounded-md border border-black/20 px-3 py-2 text-sm" />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Subtítulo (tagline)
    <input
      type="text"
      bind:value={tagline}
      placeholder="Ej. Megóhmetro digital (1Kv)"
      class="rounded-md border border-black/20 px-3 py-2 text-sm"
    />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Descripción
    <textarea bind:value={description} rows="3" class="rounded-md border border-black/20 px-3 py-2 text-sm"
    ></textarea>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Especificaciones (una por línea)
    <textarea bind:value={specsText} rows="6" class="rounded-md border border-black/20 px-3 py-2 text-sm"
    ></textarea>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Aplicaciones (una por línea)
    <textarea bind:value={applicationsText} rows="6" class="rounded-md border border-black/20 px-3 py-2 text-sm"
    ></textarea>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Categoría
    <select bind:value={categoryId} required class="rounded-md border border-black/20 px-3 py-2 text-sm">
      <option value="">Seleccionar…</option>
      {#each topLevelCategories as parent}
        <optgroup label={parent.name}>
          {#each leavesOf(parent.id) as leaf}
            <option value={leaf.id}>{leaf.name}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Marca
    <select bind:value={brandId} class="rounded-md border border-black/20 px-3 py-2 text-sm">
      <option value="">Sin marca</option>
      {#each brands as brand}
        <option value={brand.id}>{brand.name}</option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Tipo
    <select bind:value={type} class="rounded-md border border-black/20 px-3 py-2 text-sm">
      <option value="venta">Venta</option>
      <option value="alquiler">Alquiler</option>
    </select>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Precio (interno, no se muestra en el sitio)
    <input
      type="number"
      step="0.01"
      bind:value={price}
      class="rounded-md border border-black/20 px-3 py-2 text-sm"
    />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Ficha técnica (URL de PDF, opcional)
    <input
      type="url"
      bind:value={fichaTecnicaUrl}
      placeholder="https://..."
      class="rounded-md border border-black/20 px-3 py-2 text-sm"
    />
  </label>

  <label class="checkbox flex items-center gap-2 text-sm font-medium text-black">
    <input type="checkbox" bind:checked={active} />
    Activo (visible en el sitio)
  </label>

  <ImageUploader bind:value={imageUrl} />

  {#if error}<p class="error text-sm text-red-600">{error}</p>{/if}

  <button
    type="submit"
    disabled={saving}
    class="self-start rounded-pill bg-brand-blue px-6 py-2.5 text-sm font-bold uppercase text-white hover:bg-sky-600 disabled:opacity-60"
  >
    {saving ? "Guardando…" : "Guardar"}
  </button>
</form>
