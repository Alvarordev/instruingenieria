<script>
  let {
    parents = [],
    leavesByParent = {},
    brands = [],
    checkedCategoryIds = [],
    checkedBrandIds = [],
    q = "",
  } = $props();

  let expanded = $state(
    parents.filter((parent) => (leavesByParent[parent.id] ?? []).some((leaf) => checkedCategoryIds.includes(leaf.id))).map((parent) => parent.id),
  );

  function isExpanded(id) {
    return expanded.includes(id);
  }

  function toggleExpand(id) {
    expanded = isExpanded(id) ? expanded.filter((item) => item !== id) : [...expanded, id];
  }

  function parentChecked(parentId) {
    const leaves = leavesByParent[parentId] ?? [];
    return leaves.length > 0 && leaves.every((leaf) => checkedCategoryIds.includes(leaf.id));
  }

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

  function onParentToggle(event, parentId) {
    const leaves = leavesByParent[parentId] ?? [];
    const form = event.currentTarget.form;
    const checked = event.currentTarget.checked;
    for (const leaf of leaves) {
      const box = form.querySelector(`input[name="category"][value="${leaf.id}"]`);
      if (box) box.checked = checked;
    }
    form.requestSubmit();
  }

  const panel = "relative rounded-[20px] border-[0.55px] border-black/20 bg-white px-[22px] py-5 shadow-[inset_0_0_6px_rgba(0,0,0,0.2)]";
</script>

<form onsubmit={applyFilters} class="flex flex-col gap-3.5">
  <div class={panel}>
    <p class="mb-2 text-[17px] font-black text-[#4e4e4e]">Filtro por nombre</p>
    <label class="relative block">
      <span class="sr-only">Buscar por nombre</span>
      <input
        type="search"
        name="q"
        value={q}
        placeholder="FLUKE 1555"
        class="h-8 w-full rounded-[10px] border-2 border-brand-blue bg-transparent px-3 pr-9 text-xs text-[#4e4e4e] outline-none placeholder:text-[#4e4e4e]/65"
      />
      <img src="/images/shared/icon-search.svg" alt="" class="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2" />
    </label>
  </div>

  <div class="{panel} py-4">
    <p class="mb-3 text-[17px] font-black text-[#4e4e4e]">Categorías de productos</p>
    <div class="flex flex-col gap-2">
      {#each parents as parent}
        {@const leaves = leavesByParent[parent.id] ?? []}
        <div>
          <div class="flex items-center gap-2">
            <label class="flex min-w-0 flex-1 items-center gap-2">
              <input
                type="checkbox"
                class="size-[22px] rounded-[4px] border-black"
                checked={parentChecked(parent.id)}
                onchange={(event) => onParentToggle(event, parent.id)}
              />
              <span class="text-xs text-[#4e4e4e]">{parent.name}</span>
            </label>
            {#if leaves.length}
              <button
                type="button"
                class="grid size-5 place-items-center text-[#4e4e4e]"
                aria-expanded={isExpanded(parent.id)}
                aria-label={`Mostrar subcategorías de ${parent.name}`}
                onclick={() => toggleExpand(parent.id)}
              >
                <span class="text-xs">{isExpanded(parent.id) ? "▾" : "▸"}</span>
              </button>
            {/if}
          </div>
          <div class="ml-7 mt-2 flex flex-col gap-1.5 {isExpanded(parent.id) ? '' : 'hidden'}">
            {#each leaves as leaf}
              <label class="flex items-center gap-2 text-xs text-[#4e4e4e]">
                <input
                  type="checkbox"
                  name="category"
                  value={leaf.id}
                  checked={checkedCategoryIds.includes(leaf.id)}
                  class="size-[19px] rounded-[4px]"
                  onchange={(event) => event.currentTarget.form?.requestSubmit()}
                />
                {leaf.name}
              </label>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class={panel}>
    <p class="mb-3 text-[17px] font-black text-[#4e4e4e]">Filtrar por marcas</p>
    <div class="flex flex-col gap-2">
      {#each brands as brand}
        <label class="flex items-center gap-2 text-xs text-[#4e4e4e]">
          <input
            type="checkbox"
            name="brand"
            value={brand.id}
            checked={checkedBrandIds.includes(String(brand.id))}
            class="size-[22px] rounded-[4px]"
            onchange={(event) => event.currentTarget.form?.requestSubmit()}
          />
          {brand.name}
        </label>
      {/each}
    </div>
  </div>
</form>
