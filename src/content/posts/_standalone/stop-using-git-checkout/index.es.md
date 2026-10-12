---
title: "Por qué deberías dejar de usar git checkout?"
description: "Es hora de adoptar comandos de Git más claros y específicos"
---

A veces me pregunto si las herramientas que usamos todos los días podrían ser más simples. Git, por ejemplo, es como ese control remoto universal que intenta manejar todos tus dispositivos a la vez: termina siendo tan flexible que dudás de vos mismo cada vez que apretás un botón. Y si hay un comando de Git que ejemplifica perfectamente esta situación, es `git checkout`.

![Git](./git-1.webp)

## El arte de hacer demasiado

Imaginate intentar explicarle a alguien cómo funciona `git checkout`. Es como describirle una navaja suiza a alguien que nunca vio una. "Bueno, esta parte la usás para cortar, pero si la girás así es un destornillador, y si la abrís de esta otra forma...". El comando hace tantas cosas distintas que su propósito se diluye:

```bash
# Switch branches
git checkout main

# Restore a file
git checkout -- file.txt

# Create a new branch
git checkout -b feature/new-functionality

# Switch to a specific commit
git checkout a1b2c3d
```

Es como si tuviéramos una herramienta que intenta resolver todos nuestros problemas a la vez, pero que en el proceso nos obliga a pensar demasiado en cómo usarla correctamente.

## Una lección del pasado

Escuchaste hablar de la _filosofía Unix_? Es como esas reglas no escritas de la cocina que hacen que todo funcione mejor. Cada utensilio tiene su propósito específico. Los desarrolladores de Unix lo entendieron en los 70: "Que cada programa haga una sola cosa y la haga bien". Es como tener un cuchillo para cortar y un batidor para mezclar, en lugar de un aparato que intenta hacer las dos cosas de forma mediocre.

Esta idea no es solo una reliquia histórica: es la razón por la que décadas después seguimos usando muchas herramientas de Unix. Cuando cada pieza de software tiene un propósito claro, es como tener una caja de herramientas bien organizada donde sabés exactamente dónde está cada cosa y para qué sirve.

## Simplificando nuestras herramientas

Git evolucionó para adoptar esta claridad. Es como ordenar tu cocina y separar los utensilios por función: de repente, todo tiene más sentido. Así nacieron `git switch` y `git restore`.

### `git switch`: el especialista en branches

Primero tenemos `git switch`. Este comando es como tener un GPS dedicado en el auto en lugar de usar un mapa que además sirve de paraguas. Su único trabajo es manejar branches:

```bash
# Switch to main branch
git switch main

# Create and switch to a new branch
git switch -c feature/new-functionality
```

Cuando leés este comando, no hay lugar para malas interpretaciones.

### `git restore`: el maestro de la recuperación

Por otro lado, `git restore` es como tener un botón de "deshacer" específico para tus archivos. Sin ambigüedad, sin confusión: hace exactamente lo que su nombre sugiere:

```bash
# Discard changes in a file
git restore file.txt

# Remove a file from the staging area
git restore --staged file.txt
```

No es reconfortante tener un comando que hace exactamente lo que esperás que haga?

## El valor de la claridad

Quizás pienses: "Pero `git checkout` funciona, para qué cambiar?". Es como quedarte con ese viejo control remoto universal cuando podrías tener un control específico para cada dispositivo. La claridad no es solo una preferencia estética: es una inversión en la calidad de nuestro trabajo diario.

Cuando usamos comandos con un propósito claro:

- Nuestro código fluye con más naturalidad
- Es más fácil prevenir errores
- El trabajo en equipo se vuelve más fluido
- Los nuevos desarrolladores aprenden más rápido

## Un cambio chico, un gran impacto

La transición es más simple de lo que parece. Es como aprender a usar los atajos de teclado correctos: al principio requiere un esfuerzo consciente, pero pronto se vuelve natural:

```bash
# Before
git checkout main
git checkout -b new-branch
git checkout -- file.txt
git checkout HEAD file.txt
```

```bash
# Now
git switch main
git switch -c new-branch
git restore file.txt
git restore --source=HEAD --staged --worktree file.txt
```

## Construyendo mejores hábitos

El cambio en nuestras herramientas refleja una evolución en cómo pensamos el desarrollo de software. Cada vez que elegís usar `git switch` o `git restore` en lugar de `git checkout`, estás optando por la claridad y la especificidad. Es como elegir el utensilio correcto para cada tarea en la cocina: el resultado final es simplemente mejor.

La próxima vez que estés por escribir `git checkout`, frená un momento. Pensá en qué querés lograr realmente. La claridad en nuestros comandos lleva a claridad en nuestro código, y eso es algo que todos podemos apreciar.

### Recursos adicionales

- [Documentación oficial de git checkout](https://git-scm.com/docs/git-checkout)
- [Documentación oficial de git switch](https://git-scm.com/docs/git-switch)
- [Documentación oficial de git restore](https://git-scm.com/docs/git-restore)
- [Qué es la filosofía Unix?](https://en.wikipedia.org/wiki/Unix_philosophy)

