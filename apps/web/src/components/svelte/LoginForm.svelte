<script>
  let username = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();
    loading = true;
    error = "";

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    loading = false;

    if (!res.ok) {
      error = "Usuario o contraseña incorrectos";
      return;
    }

    window.location.href = "/admin";
  }
</script>

<form onsubmit={handleSubmit}>
  <label>
    Usuario
    <input type="text" bind:value={username} required />
  </label>
  <label>
    Contraseña
    <input type="password" bind:value={password} required />
  </label>
  {#if error}<p class="error">{error}</p>{/if}
  <button type="submit" disabled={loading}>{loading ? "Ingresando…" : "Ingresar"}</button>
</form>
