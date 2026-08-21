<script>
  let { value = $bindable(null) } = $props();
  let uploading = $state(false);
  let error = $state("");

  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    uploading = true;
    error = "";

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/uploads/product-image", {
      method: "POST",
      body: formData,
    });

    uploading = false;

    if (!res.ok) {
      error = "No se pudo subir la imagen";
      return;
    }

    const data = await res.json();
    value = data.url;
  }
</script>

<div class="image-uploader">
  {#if value}
    <img src={value} alt="Vista previa" />
  {/if}
  <input type="file" accept="image/jpeg,image/png,image/webp" onchange={handleChange} />
  {#if uploading}<p>Subiendo…</p>{/if}
  {#if error}<p class="error">{error}</p>{/if}
</div>
