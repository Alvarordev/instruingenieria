<script>
  import { slugify } from "../../lib/slugify";

  let { service = null, categories = [], defaultGroup = "metrologia" } = $props();

  let name = $state(service?.name ?? "");
  let description = $state(service?.description ?? "");
  let group = $state(service?.group ?? defaultGroup);
  let categoryId = $state(service?.categoryId ?? "");
  let itemsText = $state((service?.items ?? []).join("\n"));
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
      description,
      group,
      categoryId: categoryId === "" ? null : Number(categoryId),
      items: linesToArray(itemsText),
      ...(service ? {} : { slug: slugify(name) }),
    };

    const url = service ? `/api/admin/services/${service.id}` : "/api/admin/services";
    const method = service ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    saving = false;

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error = data.error ?? "No se pudo guardar";
      return;
    }

    window.location.href = "/admin/servicios";
  }
</script>

<form onsubmit={handleSubmit} class="service-form flex max-w-2xl flex-col gap-5">
  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Nombre
    <input type="text" bind:value={name} required class="rounded-md border border-black/20 px-3 py-2 text-sm" />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Descripción
    <textarea bind:value={description} rows="3" class="rounded-md border border-black/20 px-3 py-2 text-sm"
    ></textarea>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Grupo
    <select bind:value={group} class="rounded-md border border-black/20 px-3 py-2 text-sm">
      <option value="metrologia">Metrología (laboratorio)</option>
      <option value="servicios">Servicios</option>
    </select>
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium text-black">
    Categoría de productos que calibra (opcional — alimenta la grilla "Calibración" en la página del laboratorio)
    <select bind:value={categoryId} class="rounded-md border border-black/20 px-3 py-2 text-sm">
      <option value="">Sin categoría</option>
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
    Equipos que calibra / detalles (uno por línea)
    <textarea bind:value={itemsText} rows="6" class="rounded-md border border-black/20 px-3 py-2 text-sm"
    ></textarea>
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
