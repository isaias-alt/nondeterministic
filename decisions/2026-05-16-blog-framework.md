# Framework para blog.lucasco.dev

**Fecha:** 2026-05-16

---

## Contexto

El portfolio (lucasco.dev) tiene un blog en `/blog` construido con Next.js App Router, gray-matter y shiki. En Q2 2026 el blog pasa a ser prioridad: recibirá diseño propio, newsletter, búsqueda y potencialmente comentarios. Se decide sacarlo a un subdominio separado (`blog.lucasco.dev`) en un repo independiente, siguiendo el patrón de otros proyectos del autor (creacionixai.lucasco.dev, formatx.lucasco.dev).

## Decisión

Usar **Astro** en modo `hybrid` con el adaptador de Vercel para `blog.lucasco.dev`.

## Alternativas rechazadas

- **Next.js:** ya conocido por el autor, pero introduce overhead de React innecesario para un blog mayormente estático. Páginas estáticas son más lentas de servir que con Astro.

## Trade-offs aceptados

- **Familiaridad sacrificada:** el autor no toca Astro hace ~2 años. El framework cambió significativamente (Content Collections, Actions, hybrid output, Astro DB). Hay curva de aprendizaje real en el mismo quarter donde el blog es prioridad.
- **Configuración más compleja para server endpoints:** la newsletter con API route de Resend requiere modo `hybrid` + adaptador de Vercel, que el autor no ha configurado antes.

## Supuestos

- El modo `hybrid` de Astro con `@astrojs/vercel` soporta correctamente la combinación de páginas estáticas (blog posts) + endpoint de servidor (suscripción a newsletter). **Revisitar si el deploy en Vercel presenta problemas con rutas prerendered vs. server-rendered.**
- La búsqueda estática se implementará con Pagefind o Fuse.js; ambas funcionan sobre output estático sin conflicto con hybrid mode.
- El portfolio también se rediseñará, por lo tanto no hay componentes compartidos entre repos en ningún horizonte cercano.

## Sub-decisiones

### Búsqueda

- **Decisión:** Búsqueda estática en el cliente (Pagefind o Fuse.js).
- **Por qué:** Cero backend, funciona sobre el output estático de Astro.
- **Trade-off:** Sin relevance ranking dinámico ni sinónimos; suficiente para un blog personal.

### Newsletter

- **Decisión:** Resend con API route del lado del servidor.
- **Por qué:** Control total sobre el flujo de suscripción, sin depender de un form embed externo.
- **Trade-off:** Requiere hybrid mode; agrega complejidad de deploy que el autor no tiene experiencia previa.

### Diseño

- **Decisión:** Diseño desde cero, sin relación con el portfolio actual.
- **Por qué:** El portfolio también se rediseñará; compartir sistema de diseño hoy sería acoplamiento innecesario.
- **Trade-off:** No se reutiliza ningún componente existente, todo se construye nuevo.

## Puntos débiles

1. **Curva de aprendizaje compite con la prioridad del quarter.** "Aprenderé algo nuevo" y "el blog es lo más importante este Q" son objetivos en tensión. Si la fricción con Astro hybrid frena el delivery, el costo supera la ganancia de performance estático.
2. **Comentarios sin decidir.** Si se implementan con base de datos propia, se suma complejidad sobre un setup híbrido ya desconocido. Puede forzar re-arquitectura.
3. **Hybrid mode no verificado en práctica.** El adaptador de Vercel para Astro tiene comportamiento específico por ruta (prerender vs. server). No está cuantificado el riesgo de configuración.

## Diferidos

- **Sistema de comentarios:** decisión pendiente. Si se elige solución con DB propia, abrir una sesión separada para evaluar impacto en la arquitectura Astro hybrid. Alternativas a evaluar: Giscus (GitHub-based, client-side embed), Disqus, o solución custom.
- **Estrategia de content management:** ¿Markdown en repo o headless CMS (Sanity, Contentlayer)? No discutido en esta sesión. Relevante si la frecuencia de publicación aumenta o hay colaboradores.

## Referencias

- `/src/app/blog/` — implementación actual del blog en el portfolio
- `/content/` — posts en markdown del blog actual
- `pnpm-workspace.yaml` — configuración del workspace (repos separados confirmado)
- Astro hybrid output: https://docs.astro.build/en/guides/on-demand-rendering/
- Adaptador Vercel para Astro: https://docs.astro.build/en/guides/integrations-guide/vercel/
