---
title: "La dependencia que nunca declaraste"
description: "Por qué la misma línea de código funciona en un entorno y se cae en otro?"
---

Acá tenés una línea de código. No tiene nada de malo.

```js
const isMobile = window.innerWidth < 768;

export function ResponsiveLayout({ children }) {
  return isMobile
    ? <div className="mobile-view">{children}</div>
    : <div className="desktop-view">{children}</div>;
}
```

Un linter la aprueba. El type-checker la aprueba. Se ejecuta, correctamente, miles de veces por día en cada navegador que carga la página. La escribiste, la mandaste a producción y te olvidaste de ella, porque no había nada que recordar.

Después movés el renderizado al servidor, y el build se cae:

```plaintext
ReferenceError: window is not defined
    at Object.<anonymous> (/app/node_modules/somewhere/dist/index.js:3:18)
    at Module._compile (node:internal/modules/cjs/loader:1376:14)
```

Leé el stack trace antes de seguir. No se cayó mientras atendía un request. Se cayó en `Module._compile`, en el momento en que Node leyó el archivo. El componente `ResponsiveLayout` nunca se llamó. Nadie renderizó nada. El simple hecho de importar el archivo ejecutó esa primera línea, `window.innerWidth`, y en el servidor no hay ningún `window` al que llegar.

No cambiaste la línea. Es la misma línea, carácter por carácter, que funcionó mil veces. Un entorno la ejecuta, otro tira abajo el build. Entonces, cuál de los dos está en lo correcto? La pregunta suena retórica, pero no lo es, y la respuesta es todo el post: ninguno. "Correcto" nunca fue una propiedad que la línea tuviera por sí sola.

Quizás leíste que `fetch` no es parte de JavaScript. Que `setTimeout`, `document`, el DOM entero, nada de eso vive en el lenguaje; el runtime le da esas capacidades a tu código. [El post anterior](https://blog.lucasco.dev/your-code-doesnt-run-in-the-order-you-wrote-it) usó esa línea para explicar por qué tu código se ejecuta en un orden que no escribiste. Ahí la frontera funcionaba como explicación: esta es la razón por la que las cosas pasan cuando pasan.

Esta es la misma frontera, leída desde el otro lado. Porque si esas capacidades vienen del entorno, entonces una línea como `window.innerWidth` no le está pidiendo nada a JavaScript. JavaScript no tiene `window`. La línea estira la mano hacia el entorno y confía en que `window` esté ahí para agarrarla. En el navegador, está. El gesto sale bien de forma tan confiable, tan invisible, que dejás de verlo como un gesto. Parece que estás leyendo una propiedad. En realidad estás haciendo una suposición.

Y la suposición no está en ninguna parte del código. Buscala con grep en el archivo. No está en la lista de imports, no está en una firma de tipos, no está en `package.json`. "Este código necesita un `window`" es una dependencia real, tan real como cualquier paquete que instalaste, y está escrita en exactamente cero lugares. Vive solo en tu cabeza, como el entorno que casualmente te estabas imaginando cuando escribiste la línea.

Mové el código a un lugar donde esa imagen está equivocada, y la dependencia que nunca declaraste se convierte en el error que no podés explicar. `window is not defined` no es Node fallando en hacer su trabajo. Es Node avisándote de un contrato que firmaste sin leer, con una contraparte que asumiste que siempre iba a ser el navegador.

Ese error, al menos, es honesto. Se cae en el primer import, señala la línea exacta y se niega a ejecutarse. Perdés una tarde, pero la máquina te dijo la verdad en cuanto le preguntaste.

Ahora mirá la versión que no.

```js
const id = setTimeout(doWork, 1000);

// elsewhere, under some condition:
clearTimeout(id);
```

Esto se ejecuta. En el navegador y en Node, se ejecuta: sin error, sin stack trace, nada que buscar con grep. Entonces es portable. Asumiste que `setTimeout` estaba ahí, y esta vez la suposición se cumplió: los dos entornos lo tienen. El gesto sale bien de los dos lados.

Salvo que los dos `setTimeout` no son la misma función bajo el mismo nombre. En el navegador, `setTimeout` devuelve un ID numérico, un número común. En Node, devuelve un objeto `Timeout`. Misma llamada, mismos argumentos, dos cosas distintas devueltas, y tu `id` ahora es lo que el entorno haya decidido darte.

La mayoría de las veces no lo notás, porque `clearTimeout` en cada entorno entiende su propio tipo de `id`. La grieta solo se abre cuando el id cruza la línea: serializalo, mandalo a otro lado, guardalo como número porque en el navegador *era* un número, y la cancelación deja de funcionar en silencio. `clearTimeout` recibe algo que no coincide con ningún timer que conozca, se encoge de hombros y no cancela nada. El timer que querías cancelar se dispara igual. O nunca se cancela, y el handle que retiene nunca se libera, y el servidor que se suponía que tenía que soltar ese trabajo se lo queda en silencio. Horas después estás leyendo un gráfico de memoria que sube y sube, buscando un leak, y no hay ninguna línea a la que señalar, porque ninguna línea está mal.

El bug de `window` asumió una capacidad que no estaba y murió en la puerta. Este asumió una capacidad que *sí* estaba y resultó ser otra cosa con el mismo nombre. El primero es una frontera que ves en el momento en que la cruzás. El segundo es una que cruzás sin darte cuenta, cargando un valor que significa una cosa de este lado y otra del otro.

Entonces volvé a la pregunta del principio. La línea que funcionaba en el navegador y se caía en el servidor: cuál de los dos está en lo correcto?

Ninguno, porque "correcto" no es algo que una línea de código pueda ser por sí sola. Ser correcta no es algo que se guarde en la línea. Es una relación entre la línea y el entorno en el que se ejecuta, y la mitad de esa relación nunca se escribió. Escribiste `window.innerWidth`. No escribiste "en un entorno que tiene un `window`" porque no te estabas imaginando ningún otro entorno. La línea nunca fue correcta ni incorrecta. Era correcta *frente al navegador* e incorrecta *frente a Node*, y nada en el archivo te decía con cuál de los dos la estaban juzgando.

Esta es la dependencia que no aparece en ningún manifest. Listás tus paquetes, fijás tus versiones, congelás el árbol entero en el lockfile para que el código que corrió en tu máquina corra igual en la de todos los demás. Y por debajo de todo eso está la única dependencia que nunca declaraste, porque no hay ningún campo para ella: el runtime que tu código asume. Cada mano estirada a través de la frontera, cada `window`, cada `setTimeout`, es una cláusula de un contrato que no sabías que estabas firmando, con un entorno que no sabías que estabas nombrando.

No podés no firmarlo. El código siempre corre en algún lado, y ese lado siempre tiene una forma. La elección no es si depender del entorno; no podés escribir una línea que no dependa. La elección es si esa dependencia vive en tu cabeza, invisible hasta que un stack trace la saca a la luz, o si la decís en voz alta, en el código, donde la próxima persona, y el próximo entorno, puedan verla antes de que se rompa.

El navegador nunca fue el default. Era solo la habitación en la que te tocó estar cuando escribiste la línea.

