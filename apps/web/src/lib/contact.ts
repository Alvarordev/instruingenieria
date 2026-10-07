export const WHATSAPP_NUMBER = "51949262786";
export const DEFAULT_WARRANTY =
  "Se gestionarán reemplazos y reintegros únicamente cuando se compruebe una falla de origen y el reclamo se efectúe dentro de la vigencia de la garantía.";

export function whatsappUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
