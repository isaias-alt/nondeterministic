# Gestión de contenido para blog.lucasco.dev

**Fecha:** 2026-05-24

---

## Contexto

El framework de blog.lucasco.dev ya está decidido (ver `decisions/2026-05-16-blog-framework.md`): Astro en modo hybrid con adaptador de Vercel. Esta decisión, diferida en esa sesión, aborda cómo se gestiona el contenido: markdown en el repo vs. headless CMS.

El blog es personal, escrito únicamente por el autor, con una frecuencia estimada de ~2 posts/mes. Los posts son mayormente sueltos; habrá series ocasionales con estructura propia (orden explícito, descripción, landing page con metadata propia). Existen 3 posts previos en `/content/`.

## Decisión

Markdown en el repositorio, gestionado con **Astro Content Collections**.

## Alternativas rechazadas

- **Headless CMS (hosted o self-hosted):** agrega una capa de infraestructura y dependencia externa sin beneficio concreto en el contexto actual. El único editor es el autor, quien trabaja en el IDE y no necesita edición fuera de él.

## Trade-offs aceptados

- **Overhead de coordinación para series:** modelar series requiere dos colecciones separadas (`posts` y `series`). Al publicar un post en una serie hay que referenciar el slug de la serie, mantener el orden explícito entre archivos y actualizar la metadata de la serie si cambia. Esto es coordinación manual entre archivos.
- **Sin workflow de drafts/aprobaciones:** git como control de versiones no provee flujo de revisión para colaboradores no-técnicos. Si aparece un colaborador que no puede usar el IDE, esta decisión debe revisarse.

## Supuestos

- El overhead de coordinar dos colecciones en markdown es manejable a ~2 posts/mes. **Revisitar si la frecuencia aumenta significativamente o si la estructura de series crece hasta un punto donde la coordinación entre archivos se vuelve frágil.**
- El autor no necesitará editar o previsualizar contenido fuera del IDE. **Revisitar si el workflow de escritura cambia.**

## Sub-decisiones

### Sistema de colecciones

- **Decisión:** Astro Content Collections (no markdown crudo con gray-matter como en el portfolio actual).
- **Por qué:** Provee schema validation y referencias tipadas entre colecciones — necesario para modelar la relación posts ↔ series con orden explícito y metadata propia.
- **Trade-off:** Mayor configuración inicial vs. el enfoque crudo actual; a cambio, el schema previene errores de frontmatter silenciosos.

## Puntos débiles

1. **La coordinación de series no fue probada en la práctica.** El autor aceptó el overhead como "manejable" sin haber modelado aún las dos colecciones en Astro Content Collections. Si el sistema de referencias entre colecciones presenta fricción real en el workflow, el costo puede estar subestimado.
2. **No hay plan de migración para los 3 posts existentes.** Deberán adaptarse al schema de Astro Content Collections, pero el esfuerzo no fue evaluado.

## Diferidos

- **Sistema de comentarios:** ya diferido en la sesión anterior (`decisions/2026-05-16-blog-framework.md`). Sin cambios.
- **Migración de posts existentes:** los 3 posts en `/content/` (`a-blog-these-days`, `javascript-secret-superpower`, `stop-using-git-checkout`) deberán moverse a la estructura de Astro Content Collections. Operacional, no requiere sesión separada.

## Condición de revisita

Abrir una nueva sesión de decisión si: aparece un colaborador que no puede usar git o el IDE, o si se necesita un workflow de aprobaciones fuera del repositorio.

## Referencias

- `decisions/2026-05-16-blog-framework.md` — decisión de framework (Astro hybrid)
- `/content/` — posts existentes a migrar
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
