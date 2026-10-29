const base = (
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");
export async function api(path, { method = "GET", body, key, signal } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      signal,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(key ? { "X-Teacher-Key": key } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "No se pudo conectar con el servidor. Comprueba que el backend esté encendido y vuelve a intentar.",
    );
  }
  const data = await response
    .json()
    .catch(() => ({ error: "El servidor devolvió una respuesta inesperada." }));
  if (!response.ok)
    throw new Error(data.error || "No se pudo completar la solicitud.");
  return data;
}
