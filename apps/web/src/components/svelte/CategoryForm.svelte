<script>
  import { slugify } from "../../lib/slugify";

  let { category = null, topLevelCategories = [], defaultParentId = "" } = $props();

  let name = $state(category?.name ?? "");
  let parentId = $state(category?.parentId ?? defaultParentId ?? "");
  let saving = $state(false);
  let error = $state("");

  // Un padre siempre debe ser una categoría de tipo (sin padre a su vez) — así
  // la jerarquía queda en 2 niveles como espera el resto del sitio, y una
  // categoría nunca puede ser su propio padre.
  const parentOptions = topLevelCategories.filter((c) => c.id !== category?.id);

  async function handleSubmit(event) {
    event.preventDefault();
    saving = true;
    error = "";

    const body = {
      name,
      parentId: parentId === "" ? null : Number(parentId),
      ...(category ? {} : { slug: slugify(name) }),
    };

    const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
    const method = category ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    saving = false;

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error = data.error ?? "No se pudo guardar la categoría";
      return;
    }

    window.location.href = "/admin/categorias";
  }
</script>

<form onsubmit={handleSubmit} class="category-form flex max-w-xl flex-col gap-5">
  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Nombre
    <input type="text" bind:value={name} required class="rounded-md border border-black/20 px-3 py-2 text-sm" />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Categoría padre (dejar vacío para crear un tipo nuevo, ej. "Equipos Eléctricos")
    <select bind:value={parentId} class="rounded-md border border-black/20 px-3 py-2 text-sm">
      <option value="">— Sin padre (categoría de tipo) —</option>
      {#each parentOptions as parent}
        <option value={parent.id}>{parent.name}</option>
      {/each}
    </select>
  </label>

  {#if error}<p class="error text-sm text-red-600">{error}</p>{/if}

  <button
    type="submit"
    disabled={saving}
    class="self-start rounded-pill bg-brand-blue px-6 py-2.5 text-sm font-bold uppercase text-white hover:bg-sky-600 disabled:opacity-60"
  >
    {saving ? "Guardando…" : "Guardar"}
  </button>
</form>
