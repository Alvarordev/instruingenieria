<script>
  import { onMount } from "svelte";
  import { cartCount, hydrateCart, openCart } from "../../lib/cart.svelte";

  onMount(hydrateCart);

  const count = $derived(cartCount());
</script>

<button
  type="button"
  class="relative flex size-8 items-center justify-center"
  aria-label="Abrir carrito"
  onclick={openCart}
>
  <img src="/images/shared/icon-cart.png" alt="" class="size-6 object-contain" />
  {#if count > 0}
    <span
      class="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-brand-blue px-1 text-[10px] font-bold text-white"
    >
      {count}
    </span>
  {/if}
</button>
