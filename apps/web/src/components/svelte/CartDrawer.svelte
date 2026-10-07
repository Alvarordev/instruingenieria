<script>
  import { onMount } from "svelte";
  import { cart, closeCart, hydrateCart, quoteWhatsAppText, removeFromCart, setQty } from "../../lib/cart.svelte";
  import { whatsappUrl } from "../../lib/contact";

  onMount(hydrateCart);

  function onKey(event) {
    if (event.key === "Escape") closeCart();
  }

  const quoteHref = $derived(whatsappUrl(quoteWhatsAppText()));
</script>

<svelte:window onkeydown={onKey} />

{#if cart.open}
  <div class="fixed inset-0 z-[200]">
    <button
      type="button"
      class="absolute inset-0 bg-black/45"
      aria-label="Cerrar carrito"
      onclick={closeCart}
    ></button>
    <div
      class="absolute inset-y-0 right-0 flex w-[min(100%,282px)] flex-col bg-white shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div class="flex items-center justify-between px-4 pt-3">
        <span class="w-4"></span>
        <h2 id="cart-title" class="text-xl font-semibold capitalize text-brand-purple">Mi Carrito</h2>
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Cerrar" onclick={closeCart}>
          <img src="/images/shared/icon-cart-close.svg" alt="" class="size-3 object-contain" />
        </button>
      </div>
      <div class="mx-4 mt-3 border-t-2 border-brand-purple"></div>

      <ul class="flex-1 overflow-y-auto px-4 py-3">
        {#each cart.items as item (item.id)}
          <li class="mb-4 flex gap-3">
            <div class="flex size-[65px] shrink-0 items-center justify-center rounded-lg border border-black/20 bg-white p-1 shadow-[inset_0_0_6px_rgba(0,0,0,0.15)]">
              {#if item.imageUrl}
                <img src={item.imageUrl} alt="" class="size-[52px] object-contain" />
              {:else}
                <div class="size-[52px] rounded bg-gray-100"></div>
              {/if}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <p class="text-[10px] font-bold leading-snug text-[#4e4e4e]">{item.model ?? item.name}</p>
                <button type="button" aria-label={`Quitar ${item.name}`} onclick={() => removeFromCart(item.id)}>
                  <img src="/images/shared/icon-cart-trash.png" alt="" class="size-3.5 object-contain" />
                </button>
              </div>
              <p class="mt-0.5 text-[10px] leading-3 text-[#4e4e4e]">{item.name}</p>
              <label class="mt-2 inline-flex items-center">
                <span class="sr-only">Cantidad</span>
                <select
                  class="h-7 w-10 rounded-lg border border-brand-blue bg-white text-center text-sm text-[#4e4e4e]"
                  value={item.qty}
                  onchange={(event) => setQty(item.id, Number(event.currentTarget.value))}
                >
                  {#each Array.from({ length: 10 }, (_, i) => i + 1) as n}
                    <option value={n}>{n}</option>
                  {/each}
                </select>
              </label>
              {#if item.inStock}
                <p class="mt-1 text-[10px] font-bold uppercase text-[#4e4e4e]">Disponible</p>
              {/if}
            </div>
          </li>
        {:else}
          <li class="py-8 text-center text-sm text-black/50">Tu carrito está vacío.</li>
        {/each}
      </ul>

      <div class="bg-[#dceeff] px-4 py-4">
        <p class="text-xs font-bold text-[#4e4e4e]">Total</p>
        <p class="mt-1 text-[10px] leading-3 text-[#4e4e4e]">
          El delivery y las cotizaciones de los pedidos se coordinan por WhatsApp.
        </p>
        {#if cart.items.length}
          <a
            href={quoteHref}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 flex h-7 items-center justify-center rounded-lg bg-brand-blue text-xs font-bold uppercase text-white"
          >
            Cotizar en WhatsApp
          </a>
        {:else}
          <p class="mt-3 text-center text-xs text-black/40">Agrega productos para cotizar.</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
