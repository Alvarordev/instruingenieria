<script>
  let {
    subcategories = [],
    brands = [],
    checkedCategoryIds = [],
    checkedBrandIds = [],
    q = "",
  } = $props();

  function applyFilters(event) {
    event.preventDefault();
    const form = event.target;

    const categoryIds = [...form.querySelectorAll('input[name="category"]:checked')].map((el) => el.value);
    const brandIds = [...form.querySelectorAll('input[name="brand"]:checked')].map((el) => el.value);

    const params = new URLSearchParams();
    if (categoryIds.length) params.set("category", categoryIds.join(","));
    if (brandIds.length) params.set("brand", brandIds.join(","));
    const query = form.q.value.trim();
    if (query) params.set("q", query);

    window.location.search = params.toString();
  }
</script>

<form onsubmit={applyFilters} class="flex flex-col gap-6 rounded-card border border-black/10 bg-white p-6 shadow-sm">
  <label class="flex flex-col gap-1 text-sm font-semibold text-black">
    Buscar por nombre
    <input type="text" name="q" value={q} placeholder="Buscar producto…" class="rounded-md border border-black/20 px-3 py-2 text-sm" />
  </label>

  <fieldset class="flex flex-col gap-2">
    <legend class="mb-1 text-sm font-semibold uppercase text-brand-purple">Categorías de producto</legend>
    {#each subcategories as subcategory}
      <label class="flex items-center gap-2 text-sm text-black">
        <input
          type="checkbox"
          name="category"
          value={subcategory.id}
          checked={checkedCategoryIds.includes(subcategory.id)}
        />
        {subcategory.name}
      </label>
    {/each}
  </fieldset>

  <fieldset class="flex flex-col gap-2">
    <legend class="mb-1 text-sm font-semibold uppercase text-brand-purple">Filtro por marca</legend>
    {#each brands as brand}
      <label class="flex items-center gap-2 text-sm text-black">
        <input type="checkbox" name="brand" value={brand.id} checked={checkedBrandIds.includes(String(brand.id))} />
        {brand.name}
      </label>
    {/each}
  </fieldset>

  <button
    type="submit"
    class="rounded-pill bg-brand-blue px-6 py-2.5 text-sm font-bold uppercase text-white hover:bg-sky-600"
  >
    Filtrar
  </button>
</form>
