<script>
  import { CONTACT_EMAIL_SALES } from "../../lib/contact";

  let name = $state("");
  let phone = $state("");
  let email = $state("");
  let laboratory = $state("");
  let subject = $state("");
  let message = $state("");
  let status = $state(/** @type {"idle" | "sent" | "error"} */ ("idle"));
  let error = $state("");

  const fieldClass =
    "w-full rounded-[6px] border border-[#cfcfcf] bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-black/45 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25";

  function handleSubmit(event) {
    event.preventDefault();
    error = "";

    if (!name.trim() || !phone.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      status = "error";
      error = "Completa nombre, teléfono, correo, asunto y mensaje para enviar.";
      return;
    }

    const body = [
      `Nombre y apellidos: ${name.trim()}`,
      `Teléfono: ${phone.trim()}`,
      `Correo: ${email.trim()}`,
      laboratory.trim() ? `Laboratorio: ${laboratory.trim()}` : null,
      "",
      message.trim(),
    ]
      .filter((line) => line !== null)
      .join("\n");

    const href = `mailto:${CONTACT_EMAIL_SALES}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    status = "sent";
  }
</script>

<form class="flex flex-col gap-4" onsubmit={handleSubmit}>
  <label class="sr-only" for="contact-name">Nombre y apellidos</label>
  <input id="contact-name" class={fieldClass} type="text" autocomplete="name" placeholder="Nombre y Apellidos" bind:value={name} required />

  <label class="sr-only" for="contact-phone">Teléfono</label>
  <input id="contact-phone" class={fieldClass} type="tel" autocomplete="tel" placeholder="Teléfono" bind:value={phone} required />

  <label class="sr-only" for="contact-email">Correo electrónico</label>
  <input id="contact-email" class={fieldClass} type="email" autocomplete="email" placeholder="Correo Electrónico" bind:value={email} required />

  <label class="sr-only" for="contact-lab">Laboratorio</label>
  <input id="contact-lab" class={fieldClass} type="text" placeholder="Laboratorio" bind:value={laboratory} />

  <label class="sr-only" for="contact-subject">Asunto</label>
  <input id="contact-subject" class={fieldClass} type="text" placeholder="Asunto" bind:value={subject} required />

  <label class="sr-only" for="contact-message">Mensaje</label>
  <textarea
    id="contact-message"
    class="{fieldClass} min-h-[94px] resize-y"
    placeholder="Mensaje"
    bind:value={message}
    required
  ></textarea>

  {#if status === "error"}
    <p class="text-sm font-medium text-brand-red" role="alert">{error}</p>
  {/if}

  {#if status === "sent"}
    <p class="text-sm font-medium text-brand-purple" role="status">
      Se abrió tu correo para enviar el mensaje a {CONTACT_EMAIL_SALES}.
    </p>
  {/if}

  <button
    type="submit"
    class="inline-flex h-[34px] items-center justify-center rounded-pill bg-brand-blue px-8 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
  >
    Enviar
  </button>
</form>
