<script>
  import { onMount } from "svelte";
  import { addToCart, hydrateCart } from "../../lib/cart.svelte";
  import { whatsappUrl } from "../../lib/contact";

  onMount(hydrateCart);

  let { product } = $props();
  let qty = $state(1);

  const quoteHref = whatsappUrl(`Hola, quiero cotizar el producto: ${product.name}`);

  function add() {
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        model: product.model,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
      },
      qty,
    );
  }
</script>

<div class="flex flex-col gap-[18px]">
  <div class="flex flex-wrap items-center gap-[18px]">
    <div class="inline-flex h-10 w-[133px] overflow-hidden rounded-[10px] border border-brand-blue">
      <button
        type="button"
        class="grid w-9 place-items-center bg-[#ededed] text-lg leading-none text-[#4e4e4e]"
        aria-label="Menos"
        onclick={() => (qty = Math.max(1, qty - 1))}
      >
        −
      </button>
      <span class="grid flex-1 place-items-center text-[17px] text-[#4e4e4e]">{qty}</span>
      <button
        type="button"
        class="grid w-9 place-items-center bg-[#ededed] text-lg leading-none text-[#4e4e4e]"
        aria-label="Más"
        onclick={() => (qty += 1)}
      >
        +
      </button>
    </div>
    <button
      type="button"
      class="inline-flex h-10 w-[236px] items-center justify-center rounded-[10px] border border-brand-blue text-base font-bold uppercase text-brand-blue"
      onclick={add}
    >
      Agregar al carrito
    </button>
  </div>
  <a
    href={quoteHref}
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex h-[49px] w-[232px] items-center justify-center rounded-[10px] bg-brand-blue text-base font-bold uppercase text-white"
  >
    Cotizar en WhatsApp
  </a>
</div>
