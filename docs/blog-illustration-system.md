# Sistema de ilustración - blog.lucasco.dev

Pegá este archivo al inicio de cada sesión nueva donde pidas una ilustración.
El objetivo es que todas las ilustraciones del blog se vean de la misma mano,
post tras post, sin depender de la memoria automática entre chats.

## Cómo se usa

1. Escribo el post y decido qué concepto ilustrar.
2. Abro un chat nuevo (uno por ilustración, no acumular contexto).
3. Pego este spec + "ilustrame [concepto]".
4. Copio el SVG resultante y lo meto en el blog como `.svg` o inline.

## Reglas del lenguaje visual (NO negociables)

- **Fondo:** `#141C24` (azul-acero oscuro, derivado del steel-blue `#5B7A99` de la
  paleta Concrete del portafolio). Reconociblemente de la misma marca, pero NO el
  near-black del fondo de página, para que la ilustración no se mimetice.
- **Técnica:** line-art puro. Solo contornos, NUNCA relleno de color en las formas.
- **Stroke:** 1px en los contornos de cajas/formas cerradas (rects, círculos de
  contenido); 2.5px en líneas, flechas y conectores. `stroke-linecap="round"`,
  `stroke-linejoin="round"` en todos los casos.
- **Tipografía:** mono (JetBrains Mono), sin itálica, `font-weight="300"`, para
  los conceptos/labels.
- **Sin gradientes, sin sombras, sin texturas.**

## Paleta de acentos (fija)

- `#9FB8CE` - acero claro → estructura, contenedores, ejes, conectores neutros
- `#C9D67B` - lima → categoría A
- `#E0A45C` - ámbar → categoría B
- `#4EC8A0` - menta → punto focal / el elemento que importa
- `#E8E6E1` - bone → texto del núcleo central cuando hace falta máximo contraste

Usar 2-3 acentos por ilustración, no todos. El menta se reserva para el foco.

## Alcance

- SÍ: conceptos abstractos (nodos, ciclos, ejes/cuadrantes, círculos concéntricos,
  líneas de tiempo, burbujas, hexágonos, flujos) y objetos icónicos simples
  (telescopio, libro, llave, etc.).
- NO: escenas con figuras humanas o composiciones figurativas complejas. El line-art
  por coordenadas se vuelve rígido ahí. Si un post lo necesita, contratar ilustrador.

## Convenciones de diagrama (cuando el concepto lo pide)

- Dos relaciones distintas = dos tipos de flecha (sólida vs. punteada) + leyenda.
  Ej: flujo de datos (sólida) vs. dependencia de código (punteada).
- Si el concepto tiene >5-6 elementos o mensajes, partir en varias ilustraciones.
- El detalle sube en cantidad de tipos de línea y etiquetas, nunca en relleno.

## Formato técnico

- SVG, `viewBox="0 0 680 H"`, fondo como primer `<rect>` con `rx="10"`.
- Pensado para insertarse inline o como archivo `.svg` en Next.js.
