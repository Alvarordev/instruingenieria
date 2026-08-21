import { eq } from "drizzle-orm";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { brands, categories, db, products, services } from "../src";

// Mismo fallback que usa apps/api/src/lib/uploads.ts, para que este script
// escriba en el mismo directorio que sirve /uploads/* tanto en dev local
// como dentro del contenedor Docker (ahí UPLOADS_DIR=/data/uploads).
const UPLOADS_DIR =
  process.env.UPLOADS_DIR ?? join(import.meta.dir, "..", "..", "..", "apps", "api", "data", "uploads");
const SEED_ASSETS_DIR = join(import.meta.dir, "..", "seed-assets");

async function findSeedAsset(kind: "products" | "brands", slug: string) {
  const dir = join(SEED_ASSETS_DIR, kind);
  if (!existsSync(dir)) return null;
  const match = (await readdir(dir)).find((file) => file.startsWith(`${slug}.`));
  return match ? join(dir, match) : null;
}

// Copia una imagen ya comiteada en packages/db/seed-assets/ hacia el
// directorio de subidas del backend (nunca vuelve a pegarle a Figma).
// No pisa una URL que ya apunte a otro lado (ej. subida a mano desde el admin).
async function attachProductImage(slug: string, productId: number) {
  const source = await findSeedAsset("products", slug);
  if (!source) return;

  const [row] = await db.select({ imageUrl: products.imageUrl }).from(products).where(eq(products.id, productId)).limit(1);
  const currentUrl = row?.imageUrl ?? null;

  const ext = source.slice(source.lastIndexOf("."));
  const publicUrl = `/uploads/products/${slug}${ext}`;
  if (currentUrl && currentUrl !== publicUrl) return;

  const destDir = join(UPLOADS_DIR, "products");
  await mkdir(destDir, { recursive: true });
  const destPath = join(destDir, `${slug}${ext}`);
  if (!existsSync(destPath)) await copyFile(source, destPath);

  if (currentUrl !== publicUrl) {
    await db.update(products).set({ imageUrl: publicUrl }).where(eq(products.id, productId));
  }
}

async function attachBrandLogo(slug: string, brandId: number) {
  const source = await findSeedAsset("brands", slug);
  if (!source) return;

  const [row] = await db.select({ logoUrl: brands.logoUrl }).from(brands).where(eq(brands.id, brandId)).limit(1);
  const currentUrl = row?.logoUrl ?? null;

  const ext = source.slice(source.lastIndexOf("."));
  const publicUrl = `/uploads/brands/${slug}${ext}`;
  if (currentUrl && currentUrl !== publicUrl) return;

  const destDir = join(UPLOADS_DIR, "brands");
  await mkdir(destDir, { recursive: true });
  const destPath = join(destDir, `${slug}${ext}`);
  if (!existsSync(destPath)) await copyFile(source, destPath);

  if (currentUrl !== publicUrl) {
    await db.update(brands).set({ logoUrl: publicUrl }).where(eq(brands.id, brandId));
  }
}

async function upsertCategory(input: { name: string; slug: string; parentId?: number | null }) {
  const existing = await db.select().from(categories).where(eq(categories.slug, input.slug)).limit(1);
  if (existing[0]) {
    await db
      .update(categories)
      .set({ name: input.name, parentId: input.parentId ?? null })
      .where(eq(categories.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db
    .insert(categories)
    .values({ name: input.name, slug: input.slug, parentId: input.parentId ?? null })
    .returning();
  return row.id;
}

async function upsertBrand(input: { name: string; slug: string }) {
  const existing = await db.select().from(brands).where(eq(brands.slug, input.slug)).limit(1);
  if (existing[0]) return existing[0].id;
  const [row] = await db.insert(brands).values(input).returning();
  return row.id;
}

async function upsertService(input: {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  items: string[];
}) {
  const existing = await db.select().from(services).where(eq(services.slug, input.slug)).limit(1);
  const values = {
    name: input.name,
    description: input.description,
    group: "metrologia" as const,
    categoryId: input.categoryId,
    items: input.items,
  };
  if (existing[0]) {
    await db.update(services).set(values).where(eq(services.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db
    .insert(services)
    .values({ ...values, slug: input.slug })
    .returning();
  return row.id;
}

async function upsertProduct(input: {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  brandId?: number | null;
  type: "venta" | "alquiler";
  tagline?: string | null;
  specs?: string[] | null;
  applications?: string[] | null;
}) {
  const existing = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
  const values = {
    name: input.name,
    description: input.description,
    categoryId: input.categoryId,
    brandId: input.brandId ?? null,
    type: input.type,
    tagline: input.tagline ?? null,
    specs: input.specs ?? null,
    applications: input.applications ?? null,
  };
  if (existing[0]) {
    await db.update(products).set(values).where(eq(products.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db
    .insert(products)
    .values({ ...values, slug: input.slug })
    .returning();
  return row.id;
}

// ---------------------------------------------------------------------------
// Categorías nivel 1 ("tipo")
// ---------------------------------------------------------------------------

const catEquiposElectricos = await upsertCategory({ name: "Equipos Eléctricos", slug: "equipos-electricos" });
const catInstrumentacion = await upsertCategory({ name: "Instrumentación", slug: "instrumentacion" });
const catMonitoreoAmbiental = await upsertCategory({
  name: "Monitoreo Ambiental y Ocupacional",
  slug: "monitoreo-ambiental-y-ocupacional",
});
const catMantenimientoInspeccion = await upsertCategory({
  name: "Mantenimiento e Inspección Industrial",
  slug: "mantenimiento-e-inspeccion-industrial",
});
const catInstrumentosMedicion = await upsertCategory({
  name: "Instrumentos de Medición",
  slug: "instrumentos-de-medicion",
});

// ---------------------------------------------------------------------------
// Categorías nivel 2 ("subcategoría" / tag de filtro)
// ---------------------------------------------------------------------------

// Equipos Eléctricos — texto exacto del Figma (define también el orden de secciones)
const subMegohmetros = await upsertCategory({
  name: "Megóhmetros digitales hasta 20 kV",
  slug: "megohmetros-digitales-hasta-20kv",
  parentId: catEquiposElectricos,
});
const subTelurimetros = await upsertCategory({
  name: "Telurímetros digitales y puzas de tierra",
  slug: "telurimetros-digitales-y-puzas-de-tierra",
  parentId: catEquiposElectricos,
});
const subMicroOhmetros = await upsertCategory({
  name: "Micro-óhmetros portátiles",
  slug: "micro-ohmetros-portatiles",
  parentId: catEquiposElectricos,
});
const subMultimetros = await upsertCategory({
  name: "Multímetros y pinzas amperimétricas digitales",
  slug: "multimetros-y-pinzas-amperimetricas",
  parentId: catEquiposElectricos,
});
const subAnalizadoresEnergia = await upsertCategory({
  name: "Analizadores de energía y cámaras termográficas",
  slug: "analizadores-de-energia-y-camaras-termograficas",
  parentId: catEquiposElectricos,
});
const subComprobadoresResistencia = await upsertCategory({
  name: "Comprobadores de resistencia y medidores eléctricos",
  slug: "comprobadores-de-resistencia-y-medidores-electricos",
  parentId: catEquiposElectricos,
});
const subLocalizadoresTension = await upsertCategory({
  name: "Localizadores y detectores de tensión",
  slug: "localizadores-y-detectores-de-tension",
  parentId: catEquiposElectricos,
});
const subAterramiento = await upsertCategory({
  name: "Aterramiento y equipos de protección",
  slug: "aterramiento-y-equipos-de-proteccion",
  parentId: catEquiposElectricos,
});

// Instrumentación — texto exacto del Figma
const subCalibradoresProcesos = await upsertCategory({
  name: "Calibradores de procesos y comunicadores de campo",
  slug: "calibradores-de-procesos-y-comunicadores-de-campo",
  parentId: catInstrumentacion,
});
const subHornosCalibracion = await upsertCategory({
  name: "Hornos de calibración",
  slug: "hornos-de-calibracion",
  parentId: catInstrumentacion,
});
const subCalibradoresTemperatura = await upsertCategory({
  name: "Calibradores de temperatura",
  slug: "calibradores-de-temperatura",
  parentId: catInstrumentacion,
});
const subCalibradoresPresion = await upsertCategory({
  name: "Calibradores y bombas de presión",
  slug: "calibradores-y-bombas-de-presion",
  parentId: catInstrumentacion,
});

// Monitoreo Ambiental y Ocupacional — sin Figma, usando los ejemplos del usuario
const subMedicionRuido = await upsertCategory({
  name: "Medición de ruido (sonómetros)",
  slug: "medicion-de-ruido-sonometros",
  parentId: catMonitoreoAmbiental,
});
const subMedicionLuz = await upsertCategory({
  name: "Medición de luz (luxómetros)",
  slug: "medicion-de-luz-luxometros",
  parentId: catMonitoreoAmbiental,
});
await upsertCategory({
  name: "Monitoreo de gases",
  slug: "monitoreo-de-gases",
  parentId: catMonitoreoAmbiental,
});

// Mantenimiento e Inspección Industrial — sin Figma
await upsertCategory({
  name: "Termografía industrial",
  slug: "termografia-industrial",
  parentId: catMantenimientoInspeccion,
});
await upsertCategory({
  name: "Análisis de vibraciones",
  slug: "analisis-de-vibraciones",
  parentId: catMantenimientoInspeccion,
});
await upsertCategory({
  name: "Inspección visual y boroscopía",
  slug: "inspeccion-visual-y-boroscopia",
  parentId: catMantenimientoInspeccion,
});

// Instrumentos de Medición — una hoja por laboratorio de Metrología
const subInstrumentosMasa = await upsertCategory({
  name: "Instrumentos de Masa",
  slug: "instrumentos-de-masa",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosPresion = await upsertCategory({
  name: "Instrumentos de Presión",
  slug: "instrumentos-de-presion",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosHumedad = await upsertCategory({
  name: "Instrumentos de Humedad",
  slug: "instrumentos-de-humedad",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosFuerzaTorque = await upsertCategory({
  name: "Instrumentos de Fuerza y Torque",
  slug: "instrumentos-de-fuerza-y-torque",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosElectricidad = await upsertCategory({
  name: "Instrumentos de Electricidad",
  slug: "instrumentos-de-electricidad",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosLongitudAngulo = await upsertCategory({
  name: "Instrumentos de Longitud y Ángulo",
  slug: "instrumentos-de-longitud-y-angulo",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosQuimicaVolumen = await upsertCategory({
  name: "Instrumentos de Química y Volumen",
  slug: "instrumentos-de-quimica-y-volumen",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosTemperatura = await upsertCategory({
  name: "Instrumentos de Temperatura",
  slug: "instrumentos-de-temperatura",
  parentId: catInstrumentosMedicion,
});
const subInstrumentosRigidezDielectrica = await upsertCategory({
  name: "Instrumentos de Rigidez Dieléctrica",
  slug: "instrumentos-de-rigidez-dielectrica",
  parentId: catInstrumentosMedicion,
});

console.log("Categorías: ok");

// ---------------------------------------------------------------------------
// Marcas
// ---------------------------------------------------------------------------

const brandFluke = await upsertBrand({ name: "Fluke", slug: "fluke" });
const brandMegabras = await upsertBrand({ name: "Megabras", slug: "megabras" });
const brandCatu = await upsertBrand({ name: "Catu", slug: "catu" });
const brandAmprobe = await upsertBrand({ name: "Amprobe", slug: "amprobe" });
const brandSew = await upsertBrand({ name: "Sew Eurodrive", slug: "sew-eurodrive" });

await attachBrandLogo("fluke", brandFluke);
await attachBrandLogo("megabras", brandMegabras);
await attachBrandLogo("catu", brandCatu);
await attachBrandLogo("amprobe", brandAmprobe);
await attachBrandLogo("sew-eurodrive", brandSew);

console.log("Marcas: ok");

// ---------------------------------------------------------------------------
// Laboratorios de Metrología (services, group=metrologia)
// ---------------------------------------------------------------------------

await upsertService({
  name: "Laboratorio de Masa",
  slug: "laboratorio-de-masa",
  categoryId: subInstrumentosMasa,
  description:
    "El laboratorio de Masa realiza calibraciones de balanzas y pesas patrón, garantizando trazabilidad metrológica según los requisitos de la norma NTP-ISO/IEC 17025.",
  items: [
    "Balanza Analítica",
    "Microbalanza",
    "Balanza de Precisión",
    "Balanza Colgante",
    "Balanza para Joyería",
    "Balanza de Plataforma",
    "Balanza Mecánica",
    "Pesas M1",
    "Pesas M2, M3",
  ],
});

await upsertService({
  name: "Laboratorio de Presión",
  slug: "laboratorio-de-presion",
  categoryId: subInstrumentosPresion,
  description:
    "El laboratorio de Presión calibra manómetros, transmisores y calibradores de presión en distintos rangos, asegurando exactitud en procesos industriales.",
  items: ["Manómetro", "Transmisor de Presión", "Vacuómetro", "Calibrador de Presión", "Manómetro Digital", "Bomba de Presión"],
});

await upsertService({
  name: "Laboratorio de Humedad",
  slug: "laboratorio-de-humedad",
  categoryId: subInstrumentosHumedad,
  description:
    "El laboratorio de Humedad calibra instrumentos de medición de humedad relativa y punto de rocío para entornos industriales y de almacenamiento.",
  items: ["Higrómetro", "Termohigrómetro", "Sensor de Humedad Relativa", "Data Logger de Humedad"],
});

await upsertService({
  name: "Laboratorio de Fuerza y Torque",
  slug: "laboratorio-de-fuerza-y-torque",
  categoryId: subInstrumentosFuerzaTorque,
  description:
    "El laboratorio de Fuerza y Torque calibra torquímetros, dinamómetros y celdas de carga usados en montaje y mantenimiento industrial.",
  items: ["Torquímetro", "Dinamómetro", "Llave de Torque", "Celda de Carga"],
});

await upsertService({
  name: "Laboratorio de Electricidad",
  slug: "laboratorio-de-electricidad",
  categoryId: subInstrumentosElectricidad,
  description:
    "El laboratorio de Electricidad calibra multímetros, pinzas amperimétricas y megóhmetros usados en mantenimiento eléctrico industrial.",
  items: ["Multímetro", "Pinza Amperimétrica", "Fuente de Voltaje", "Megóhmetro"],
});

await upsertService({
  name: "Laboratorio de Longitud y Ángulo",
  slug: "laboratorio-de-longitud-y-angulo",
  categoryId: subInstrumentosLongitudAngulo,
  description:
    "El laboratorio de Longitud y Ángulo realiza calibraciones dimensionales en el orden de los micrómetros, con diversos patrones como bloques y anillos patrón.",
  items: ["Micrómetro", "Calibrador Vernier", "Nivel de Precisión", "Goniómetro", "Bloques Patrón"],
});

await upsertService({
  name: "Laboratorio de Química y Volumen",
  slug: "laboratorio-de-quimica-y-volumen",
  categoryId: subInstrumentosQuimicaVolumen,
  description:
    "El laboratorio de Química y Volumen calibra material volumétrico de laboratorio, asegurando exactitud en mediciones de líquidos.",
  items: ["Bureta", "Pipeta", "Matraz Volumétrico", "Probeta"],
});

await upsertService({
  name: "Laboratorio de Temperatura",
  slug: "laboratorio-de-temperatura",
  categoryId: subInstrumentosTemperatura,
  description:
    "El laboratorio de Temperatura calibra termómetros, termopares y pirómetros usados en procesos industriales y de control de calidad.",
  items: ["Termómetro", "Termopar", "Termohigrómetro", "Pirómetro"],
});

await upsertService({
  name: "Laboratorio de Ensayos de Rigidez Dieléctrica",
  slug: "laboratorio-de-ensayos-de-rigidez-dielectrica",
  categoryId: subInstrumentosRigidezDielectrica,
  description:
    "El laboratorio de Ensayos de Rigidez Dieléctrica evalúa la capacidad de aislamiento de materiales y equipos eléctricos ante altos voltajes.",
  items: ["Equipo de Ensayo Dieléctrico", "Megóhmetro de Alto Voltaje", "Hipot Tester"],
});

console.log("Laboratorios de Metrología: ok");

// ---------------------------------------------------------------------------
// Productos — Alquiler (Equipos Eléctricos)
// ---------------------------------------------------------------------------

const productFluke1507 = await upsertProduct({
  name: "Fluke 1507",
  slug: "fluke-1507",
  categoryId: subMegohmetros,
  brandId: brandFluke,
  type: "alquiler",
  tagline: "Megóhmetro digital (1Kv)",
  description:
    "El Fluke 1507 es un medidor digital de aislamiento compacto y robusto, diseñado para ofrecer resultados precisos y confiables en entornos industriales, eléctricos y de mantenimiento. Gracias a sus múltiples rangos de voltaje de prueba y a su interfaz intuitiva, facilita la detección de fallas, degradación del aislamiento y condiciones inseguras en sistemas eléctricos.",
  specs: [
    "Rangos de prueba de aislamiento: 0.01 MΩ a 10 GΩ.",
    "Voltajes de prueba seleccionables: 50 V, 100 V, 250 V, 500 V y 1000 V.",
    "Medición de voltaje CA/CC de 0.1 V a 600 V.",
    "Diseño compacto, resistente y fácil de usar.",
    "Función de detección automática de voltaje para mayor seguridad.",
    "Adecuado para pruebas de aislamiento de rutina y mantenimiento preventivo.",
  ],
  applications: [
    "Pruebas de aislamiento en motores, transformadores y cables eléctricos.",
    "Evaluación del estado del aislamiento en tableros eléctricos y equipos industriales.",
    "Mantenimiento preventivo en instalaciones comerciales, industriales y residenciales.",
    "Verificación de seguridad en equipos eléctricos antes de su puesta en marcha.",
    "Diagnóstico de fallas en sistemas eléctricos de baja y media tensión.",
  ],
});
await attachProductImage("fluke-1507", productFluke1507);

const productFluke1550c = await upsertProduct({
  name: "Fluke 1550C (5 kV)",
  slug: "fluke-1550c",
  categoryId: subMegohmetros,
  brandId: brandFluke,
  type: "alquiler",
  tagline: "Megóhmetro digital de (5 kV)",
  description:
    "El Fluke 1550C es un megóhmetro de 5 kV pensado para pruebas de aislamiento de alta precisión en equipos de media tensión.",
  specs: [
    "Voltaje de prueba de hasta 5000 V.",
    "Medición de resistencia de aislamiento hasta 15 TΩ.",
    "Función de descarga automática para mayor seguridad.",
    "Pantalla de alto contraste, legible en exteriores.",
  ],
  applications: [
    "Pruebas de aislamiento en motores y generadores de media tensión.",
    "Mantenimiento predictivo en subestaciones eléctricas.",
    "Evaluación de cables de media tensión.",
  ],
});
await attachProductImage("fluke-1550c", productFluke1550c);

await upsertProduct({
  name: "Fluke 1555",
  slug: "fluke-1555",
  categoryId: subMegohmetros,
  brandId: brandFluke,
  type: "alquiler",
  tagline: "Megóhmetro digital de (10 kV)",
  description:
    "El Fluke 1555 extiende el rango de prueba a 10 kV para aplicaciones de aislamiento de alta tensión.",
  specs: [
    "Voltaje de prueba de hasta 10 000 V.",
    "Memoria interna para registro de pruebas.",
    "Cálculo automático de índices de polarización y absorción dieléctrica.",
  ],
  applications: [
    "Pruebas de aislamiento en equipos de alta tensión.",
    "Certificación de cables y transformadores de potencia.",
  ],
});

const productMegabrasMd15kvr = await upsertProduct({
  name: "Megabras MD-15KVR",
  slug: "megabras-md-15kvr",
  categoryId: subMegohmetros,
  brandId: brandMegabras,
  type: "alquiler",
  tagline: "Megóhmetro digital de (15 kV)",
  description: "El Megabras MD-15KVR es un megóhmetro digital de 15 kV para pruebas de aislamiento de alta exigencia.",
  specs: ["Voltaje de prueba de hasta 15 000 V.", "Diseño robusto para uso en campo.", "Batería de larga duración."],
  applications: ["Pruebas de aislamiento en equipos de alta tensión.", "Mantenimiento en subestaciones industriales."],
});
await attachProductImage("megabras-md-15kvr", productMegabrasMd15kvr);

await upsertProduct({
  name: "Megabras MTD-20",
  slug: "megabras-mtd-20",
  categoryId: subTelurimetros,
  brandId: brandMegabras,
  type: "alquiler",
  tagline: "Telurímetro digital",
  description: "Telurímetro digital para medición de resistencia de puesta a tierra en sistemas eléctricos e industriales.",
  specs: ["Medición por el método de caída de potencial.", "Rango de medición amplio con alta resolución."],
  applications: ["Verificación de sistemas de puesta a tierra.", "Mantenimiento preventivo de instalaciones eléctricas."],
});

await upsertProduct({
  name: "Megabras MTD-10",
  slug: "megabras-mtd-10",
  categoryId: subTelurimetros,
  brandId: brandMegabras,
  type: "alquiler",
  tagline: "Telurímetro digital portátil",
  description: "Versión portátil del telurímetro digital, ideal para trabajos de campo.",
  specs: ["Ligero y portátil.", "Incluye puzas de tierra y cables de prueba."],
  applications: ["Medición de resistencia de tierra en campo."],
});

await upsertProduct({
  name: "Megabras MO-10",
  slug: "megabras-mo-10",
  categoryId: subMicroOhmetros,
  brandId: brandMegabras,
  type: "alquiler",
  tagline: "Micro-óhmetro portátil",
  description: "Micro-óhmetro portátil para medición de baja resistencia en contactos y devanados.",
  specs: ["Medición de resistencias desde microohmios.", "Ideal para pruebas de contactos de interruptores."],
  applications: ["Mantenimiento de interruptores y contactores.", "Verificación de uniones y conexiones eléctricas."],
});

await upsertProduct({
  name: "Amprobe AM-520",
  slug: "amprobe-am-520",
  categoryId: subMultimetros,
  brandId: brandAmprobe,
  type: "alquiler",
  tagline: "Multímetro digital",
  description: "Multímetro digital de uso general para mediciones eléctricas industriales.",
  specs: ["Medición de voltaje, corriente y resistencia.", "Protección contra sobrecargas."],
  applications: ["Diagnóstico eléctrico general.", "Mantenimiento industrial de rutina."],
});

await upsertProduct({
  name: "Fluke 376 FC",
  slug: "fluke-376fc",
  categoryId: subMultimetros,
  brandId: brandFluke,
  type: "alquiler",
  tagline: "Pinza amperimétrica digital",
  description: "Pinza amperimétrica con conectividad inalámbrica para mediciones remotas de CA/CC.",
  specs: ["Medición de corriente CA/CC hasta 1000 A.", "Conectividad Fluke Connect."],
  applications: ["Medición de corriente en tableros eléctricos.", "Diagnóstico remoto de instalaciones."],
});

await upsertProduct({
  name: "Fluke 1738",
  slug: "fluke-1738",
  categoryId: subAnalizadoresEnergia,
  brandId: brandFluke,
  type: "alquiler",
  tagline: "Analizador de energía trifásico",
  description: "Registrador de calidad de energía trifásico para diagnóstico de instalaciones eléctricas.",
  specs: ["Registro de parámetros de calidad de energía.", "Memoria para registros de larga duración."],
  applications: ["Auditorías energéticas.", "Diagnóstico de problemas de calidad de energía."],
});

await upsertProduct({
  name: "Fluke TiS20+",
  slug: "fluke-tis20",
  categoryId: subAnalizadoresEnergia,
  brandId: brandFluke,
  type: "alquiler",
  tagline: "Cámara termográfica",
  description: "Cámara termográfica para inspección de tableros y equipos eléctricos sin contacto.",
  specs: ["Resolución térmica de 206 x 156 píxeles.", "Detección de puntos calientes a distancia segura."],
  applications: ["Inspección termográfica de tableros eléctricos.", "Mantenimiento predictivo."],
});

await upsertProduct({
  name: "Catu MO-200",
  slug: "catu-mo-200",
  categoryId: subComprobadoresResistencia,
  brandId: brandCatu,
  type: "alquiler",
  tagline: "Comprobador de resistencia",
  description: "Comprobador de resistencia y continuidad para instalaciones eléctricas industriales.",
  specs: ["Medición de resistencia de aislamiento y continuidad."],
  applications: ["Verificación de instalaciones eléctricas.", "Mantenimiento preventivo."],
});

await upsertProduct({
  name: "Catu DT-200",
  slug: "catu-dt-200",
  categoryId: subLocalizadoresTension,
  brandId: brandCatu,
  type: "alquiler",
  tagline: "Detector de tensión",
  description: "Detector de tensión sin contacto para verificación de ausencia de tensión antes de trabajos eléctricos.",
  specs: ["Detección de tensión sin contacto.", "Cumple normas de seguridad eléctrica."],
  applications: ["Verificación de ausencia de tensión.", "Trabajos de mantenimiento eléctrico seguro."],
});

await upsertProduct({
  name: "Catu Kit de Aterramiento Portátil",
  slug: "catu-kit-aterramiento",
  categoryId: subAterramiento,
  brandId: brandCatu,
  type: "alquiler",
  tagline: "Kit de puesta a tierra portátil",
  description: "Kit de puesta a tierra temporal para trabajos de mantenimiento en instalaciones eléctricas.",
  specs: ["Incluye pinzas y cables de aterramiento.", "Diseñado para uso en campo."],
  applications: ["Puesta a tierra temporal durante mantenimiento.", "Protección del personal en trabajos eléctricos."],
});

console.log("Productos de alquiler: ok");

// ---------------------------------------------------------------------------
// Productos — Venta (alimentan las grillas de Calibración de Metrología)
// ---------------------------------------------------------------------------

await upsertProduct({
  name: "Balanza Analítica 220g",
  slug: "balanza-analitica-220g",
  categoryId: subInstrumentosMasa,
  type: "venta",
  tagline: "Balanza analítica de precisión",
  description: "Balanza analítica de 220 g de capacidad, resolución de 0.1 mg, para uso en laboratorio.",
  specs: ["Capacidad: 220 g.", "Resolución: 0.1 mg.", "Calibración interna automática."],
  applications: ["Pesaje de precisión en laboratorio.", "Control de calidad."],
});

await upsertProduct({
  name: "Balanza de Precisión 6kg",
  slug: "balanza-precision-6kg",
  categoryId: subInstrumentosMasa,
  type: "venta",
  tagline: "Balanza de precisión industrial",
  description: "Balanza de precisión de 6 kg de capacidad para uso industrial y de laboratorio.",
  specs: ["Capacidad: 6000 g.", "Resolución: 0.01 g."],
  applications: ["Pesaje industrial de precisión.", "Formulación y dosificación."],
});

await upsertProduct({
  name: "Manómetro Digital MP-100",
  slug: "manometro-digital-mp",
  categoryId: subInstrumentosPresion,
  type: "venta",
  tagline: "Manómetro digital de precisión",
  description: "Manómetro digital para medición y calibración de presión en procesos industriales.",
  specs: ["Rango: 0 a 100 bar.", "Precisión: ±0.05% del fondo de escala."],
  applications: ["Calibración de instrumentos de presión.", "Control de procesos industriales."],
});

await upsertProduct({
  name: "Calibrador de Presión CP-500",
  slug: "calibrador-presion-cp",
  categoryId: subInstrumentosPresion,
  type: "venta",
  tagline: "Calibrador de presión portátil",
  description: "Calibrador de presión portátil para trabajos de campo y laboratorio.",
  specs: ["Múltiples rangos de presión intercambiables.", "Memoria interna de calibraciones."],
  applications: ["Calibración en campo de transmisores de presión."],
});

await upsertProduct({
  name: "Fluke 87V",
  slug: "fluke-87v",
  categoryId: subInstrumentosElectricidad,
  brandId: brandFluke,
  type: "venta",
  tagline: "Multímetro industrial de precisión",
  description: "Multímetro digital de referencia para diagnóstico eléctrico industrial de alta precisión.",
  specs: ["True-RMS.", "Medición de temperatura, capacitancia y frecuencia."],
  applications: ["Diagnóstico eléctrico industrial.", "Calibración de instrumentos eléctricos."],
});

await upsertProduct({
  name: "Termómetro Infrarrojo TI-200",
  slug: "termometro-infrarrojo",
  categoryId: subInstrumentosTemperatura,
  type: "venta",
  tagline: "Termómetro infrarrojo sin contacto",
  description: "Termómetro infrarrojo para medición de temperatura sin contacto en procesos industriales.",
  specs: ["Rango: -50°C a 550°C.", "Relación distancia-punto 12:1."],
  applications: ["Medición de temperatura sin contacto.", "Mantenimiento predictivo."],
});

console.log("Productos de venta: ok");
console.log("Seed de catálogo completo.");
