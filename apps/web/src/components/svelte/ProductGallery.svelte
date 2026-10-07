<script>
  let { name, images = [] } = $props();
  let selected = $state(0);
  const list = $derived(images.filter(Boolean));
  const current = $derived(list[selected] ?? list[0] ?? null);

  function prev() {
    if (!list.length) return;
    selected = (selected - 1 + list.length) % list.length;
  }
  function next() {
    if (!list.length) return;
    selected = (selected + 1) % list.length;
  }
</script>

<div class="flex flex-col gap-3 sm:grid sm:grid-cols-[122px_minmax(0,386px)] sm:gap-3">
  <div class="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
    {#each list as src, index}
      <button
        type="button"
        class="flex size-[122px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] border-[0.55px] border-black/25 bg-white p-2 {index === selected
          ? 'border-brand-blue'
          : ''}"
        onclick={() => (selected = index)}
      >
        <img src={src} alt="" class="h-full w-full object-contain" />
      </button>
    {/each}
  </div>
  <div
    class="relative flex aspect-square w-full max-w-[386px] items-center justify-center overflow-hidden rounded-[20px] border-[0.55px] border-black/25 bg-white p-4"
  >
    {#if current}
      <img src={current} alt={name} class="h-full w-full object-contain" />
    {:else}
      <div class="h-full w-full rounded-md bg-gray-100" aria-hidden="true"></div>
    {/if}
    {#if list.length > 1}
      <button
        type="button"
        class="absolute left-3 top-1/2 size-[38px] -translate-y-1/2 overflow-hidden"
        aria-label="Imagen anterior"
        onclick={prev}
      >
        <img src="/images/shared/icon-gallery-next.svg" alt="" class="size-[38px]" />
      </button>
      <button
        type="button"
        class="absolute right-3 top-1/2 size-[38px] -translate-y-1/2 overflow-hidden"
        aria-label="Imagen siguiente"
        onclick={next}
      >
        <img src="/images/shared/icon-gallery-next.svg" alt="" class="size-[38px] rotate-180" />
      </button>
    {/if}
  </div>
</div>
