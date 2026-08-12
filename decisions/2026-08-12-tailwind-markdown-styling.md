# Styling markdown-rendered content under Tailwind

**Fecha:** 2026-08-12

---

## Contexto

El blog migró de CSS con variables (sistema "Concrete", ver
`prompt.md` sección 3) a Tailwind v4, a pedido de Lucas, revirtiendo la
decisión original del kickoff ("no instalar Tailwind"). La migración cubre
todos los componentes `.astro` sin problema: son templates que Astro
compila, así que las clases de Tailwind escritas ahí se detectan por el
escaneo de contenido de Tailwind sin más.

El problema aparece en una sola pieza del sitio: el cuerpo de los posts.
Ese HTML (`<h2>`, `<p>`, `<code>`, `<blockquote>`, `<pre>` con el highlighting
de Shiki, etc.) no lo escribe ningún componente Astro — lo genera el
pipeline de markdown (`remark`/`rehype`) a partir del `.md` de cada post, en
build time. No hay ningún lugar en el código donde se pueda escribir
`class="text-bone font-archivo ..."` a mano sobre esos tags, porque esos
tags no existen como texto en ningún archivo que Tailwind escanee.

## Decisión

Dos transformadores custom que inyectan clases de Tailwind directamente en
el árbol HAST (el AST que usan remark/rehype) durante el build, en vez de
CSS escrito a mano apuntando a esos tags:

1. **`src/styles/rehype-prose-classes.ts`** — un plugin rehype que recorre
   el árbol del cuerpo del post y le agrega `className` (con clases
   Tailwind reales) a `p`, `h2`, `h3`, `ul`/`ol`, `a`, `blockquote`, `img` y
   `code` inline (distinguido de `code` dentro de `pre` mirando el padre).
2. **`src/styles/shiki-code-chrome.ts`** (ya existía desde T6, para el chrome
   de terminal de los code blocks) — se actualizó para que el wrapper, la
   barra, el label de lenguaje y el botón de copy usen clases Tailwind en
   vez de nombres semánticos (`code-block`, `code-bar`, etc.). Los hooks
   `pre`/`code` del transformer de Shiki también reciben clases Tailwind
   para el padding/tipografía del cuerpo del code block.

El acoplamiento con el JS del botón de copiar (`[slug].astro`) se resolvió
con atributos `data-code-block`/`data-code-copy`, separados a propósito de
las clases de estilo — el JS ya no depende de qué clases visuales tenga el
elemento.

## Alternativas rechazadas

- **`@tailwindcss/typography` (el plugin oficial `prose`):** es la solución
  estándar para exactamente este problema (estilar HTML que no controlás).
  Se rechazó porque el sistema de diseño Concrete es muy específico (colores
  exactos, el prefijo `# ` en steel antes de cada H2, el chrome de terminal
  en los code blocks) — se hubiera terminado sobreescribiendo casi toda la
  configuración por defecto del plugin, sin ahorrar trabajo real, y sumando
  una dependencia nueva que va en contra del espíritu de minimalismo del
  proyecto (`prompt.md` sección 2: "no agregar librerías... fuera de lo que
  ya trae el template").
- **CSS a mano con `@apply` sobre selectores de tag (`.prose h2 { @apply ... }`):**
  técnicamente funciona en Tailwind v4, pero significa mantener dos sistemas
  en paralelo (utilidades en los componentes, `@apply` para el contenido de
  markdown) — exactamente la inconsistencia que se buscaba evitar al migrar
  a Tailwind "de una vez, en todo el sitio".
- **Dejar el CSS viejo (variables + selectores globales) solo para el
  prose:** más simple de escribir, pero deja al proyecto con dos sistemas
  de estilos conviviendo permanentemente, no una migración real.

## Trade-offs aceptados

- **Complejidad de build más alta:** en vez de una hoja de estilos, el
  proyecto tiene dos transformadores de AST escritos a mano
  (`rehype-prose-classes.ts`, `shiki-code-chrome.ts`) que hay que entender
  para tocar el estilo del cuerpo de un post. Requiere saber manipular HAST
  (`hast.Element`, `properties.className` como array), no es CSS plano.
- **Nueva dependencia de build:** `unist-util-visit` (recorrido de árbol),
  agregada como dependencia directa porque corre durante `astro build`, no
  solo en dev.
- **Las clases de Tailwind viven en un `.ts`, no en el markup:** Tailwind
  detecta las clases porque escanea todos los archivos de texto del
  proyecto por defecto (no solo `.astro`), así que strings como
  `'mb-[22px] font-inter text-[17px]'` dentro de `rehype-prose-classes.ts`
  se detectan igual. Es menos legible que verlas en un template, pero
  funciona sin configuración adicional del escaneo de Tailwind.

## Supuestos

- El escaneo de contenido de Tailwind v4 (sin configuración extra) cubre
  archivos `.ts` del proyecto, no solo `.astro`/`.html`. **Revisitar si en
  el futuro Tailwind cambia su heurística de escaneo por defecto** y las
  clases dejan de generarse.
- Ningún otro tipo de contenido futuro (por ejemplo, MDX con componentes
  embebidos) va a necesitar un mecanismo de estilado distinto al de
  markdown plano. Si se habilita MDX con componentes Astro/React embebidos,
  esos componentes SÍ pueden llevar clases Tailwind directas en su propio
  archivo, y `rehypeProseClasses` seguiría aplicando solo a los tags de
  markdown puro alrededor.

## Puntos débiles

1. **Un solo lugar de verdad para el "prose", pero no obvio.** Alguien que
   busque cómo se estila un `<h2>` de post en el CSS no lo va a encontrar
   ahí — está en `rehype-prose-classes.ts`. Vale la pena dejarlo linkeado
   desde `prompt.md` o el README si se pierde el hilo.
2. **No hay tipado fuerte sobre qué tags están cubiertos.** Si el markdown
   de un post futuro usa `<table>`, `<hr>`, o `<dl>`, ese HTML sale sin
   clases (heredando solo el reset de Tailwind), sin avisar. Hay que
   acordarse de extender el `switch` en `rehypeProseClasses` a mano.

## Diferidos

- Ninguno. Este documento cierra la decisión tomada en la sesión del
  2026-08-12; no quedó nada pendiente de otra sesión.

## Referencias

- `src/styles/rehype-prose-classes.ts` — plugin rehype para el cuerpo del post
- `src/styles/shiki-code-chrome.ts` — transformer de Shiki para el chrome de code blocks
- `prompt.md` sección 2 — decisión original "no Tailwind", revertida en esta sesión
- `prompt.md` sección 3 — sistema de diseño Concrete, tokens mapeados a `@theme` en `src/styles/global.css`
- Tailwind v4 `@theme` / content detection: https://tailwindcss.com/docs/detecting-classes-in-source-files
