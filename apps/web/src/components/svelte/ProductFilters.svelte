<script>
  let { categories = [], brands = [] } = $props();

  function applyFilters(event) {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(event.target));
    for (const [key, value] of [...params.entries()]) {
      if (!value) params.delete(key);
    }
    window.location.search = params.toString();
  }
</script>

<form onsubmit={applyFilters} class="product-filters">
  <select name="category">
    <option value="">Todas las categorías</option>
    {#each categories as category}
      <option value={category.id}>{category.name}</option>
    {/each}
  </select>
  <select name="brand">
    <option value="">Todas las marcas</option>
    {#each brands as brand}
      <option value={brand.id}>{brand.name}</option>
    {/each}
  </select>
  <select name="type">
    <option value="">Venta y alquiler</option>
    <option value="venta">Venta</option>
    <option value="alquiler">Alquiler</option>
  </select>
  <button type="submit">Filtrar</button>
</form>
