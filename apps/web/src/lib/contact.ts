export const WHATSAPP_NUMBER = "51949262786";
export const CONTACT_EMAIL_SALES = "ventas@instruingenieria.com";
export const CONTACT_EMAIL_MAIN = "mayker.ramos@instruingenieria.com";
export const DEFAULT_WARRANTY =
  "Se gestionarán reemplazos y reintegros únicamente cuando se compruebe una falla de origen y el reclamo se efectúe dentro de la vigencia de la garantía.";

export const LIMA_ADDRESS = "Calle Verbenas N° 113, Urb. Salamanca - Ate";
export const HUANCAYO_ADDRESS = "Av. La Esperanza N° 966, El Tambo – Huancayo";

export const LIMA_MAP_QUERY = "Calle Verbenas 113, Urb. Salamanca, Ate, Lima, Perú";
export const HUANCAYO_MAP_QUERY = "Av. La Esperanza 966, El Tambo, Huancayo, Junín, Perú";

export function mapsEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function whatsappUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
