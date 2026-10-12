---
title: "The Dependency You Never Declared"
description: "Why the same line of code works in one environment and crashes in other"
pubDate: "2026-10-12"
# updatedDate: "2026-08-27"
draft: true
# cover: (optional, no cover image for this post)
# series: (optional, this post is standalone, not part of a series)
# order: (optional, only used when `series` is set)
---

Here's a line of code. There is nothing wrong with it.

```js
const isMobile = window.innerWidth < 768;

export function ResponsiveLayout({ children }) {
  return isMobile
    ? <div className="mobile-view">{children}</div>
    : <div className="desktop-view">{children}</div>;
}
```

A linter approves it. The type-checker approves it. It runs, correctly, thousands of times a day in every browser that loads the page. You wrote it, shipped it, and forgot about it, because there was nothing to remember.

Then you move your rendering to the server, and the build falls over:

```plaintext
ReferenceError: window is not defined
    at Object.<anonymous> (/app/node_modules/somewhere/dist/index.js:3:18)
    at Module._compile (node:internal/modules/cjs/loader:1376:14)
```

Read the stack trace before you read on. It didn't crash while handling a request. It crashed at `Module._compile`, the moment Node read the file. The `ResponsiveLayout` component was never called. Nobody rendered anything. The mere act of importing the file ran that first line, `window.innerWidth`, and on the server there is no `window` for it to reach.

You didn't change the line. The line is the same character-for-character line that worked a thousand times. One environment runs it, another tears the build down. So which one is right? The question sounds rhetorical, but it isn't, and the answer is the whole post: neither. "Right" was never a property the line had on its own.

Maybe you've read that `fetch` isn't part of JavaScript. That `setTimeout`, `document`, the whole DOM, none of it lives in the language itself; the runtime hands those capabilities to your code. [The previous post](https://blog.lucasco.dev/your-code-doesnt-run-in-the-order-you-wrote-it) used that line to explain why your code runs in an order you didn't write. That was the frontier as an explanation: here's why things happen when they happen.

This is the same frontier, read from the other side. Because if those capabilities come from the environment, then a line like `window.innerWidth` isn't asking JavaScript for anything. JavaScript has no `window`. The line is reaching across to the environment and trusting that `window` is there to catch it. In the browser, it is. The reach succeeds so reliably, so invisibly, that you stop seeing it as a reach at all. It looks like you're reading a property. You're actually making an assumption.

And the assumption is nowhere in the code. Grep the file for it. It isn't in the import list, it isn't in a type signature, it isn't in `package.json`. "This code requires a `window`" is a real dependency, as real as any package you installed, and it is written down in exactly zero places. It lives only in your head, as the environment you happened to be picturing when you wrote the line.

Move the code to a place where that picture is wrong, and the dependency you never declared becomes the error you can't explain. `window is not defined` isn't Node failing to do its job. It's Node telling you about a contract you signed without reading, with a counterparty you assumed would always be the browser.

That error, at least, is honest. It crashes at the first import, points at the exact line, and refuses to run. You lose an afternoon, but the machine told you the truth the moment you asked.

Now take the version that doesn't.

```js
const id = setTimeout(doWork, 1000);

// elsewhere, under some condition:
clearTimeout(id);
```

This runs. In the browser and in Node, it runs, no error, no stack trace, nothing to grep for. So it's portable. You assumed `setTimeout` was there, and this time the assumption held: both environments have it. The reach succeeds on both sides.

Except the two `setTimeout`s aren't the same function wearing the same name. In the browser, `setTimeout` returns a numeric ID, a plain number. In Node, it returns a `Timeout` object. Same call, same arguments, two different things handed back, and your `id` is now whichever one the environment decided to give you.

Most of the time you never notice, because `clearTimeout` in each environment understands its own kind of `id`. The crack only opens when the id crosses the line: serialize it, send it somewhere, store it as a number because in the browser it *was* a number, and cancellation silently stops working. `clearTimeout` gets something that doesn't match any timer it knows, shrugs, and clears nothing. The timer you meant to cancel fires anyway. Or it never gets cleared, and the handle it holds never gets released, and the server that was supposed to shed that work quietly keeps it. Hours later you're reading a memory graph that climbs and climbs, looking for a leak, and there is no line to point at, because no line is wrong.

The `window` bug assumed a capability that wasn't there and died at the door. This one assumed a capability that *was* there and turned out to be a different thing with the same name. The first is a frontier you can see the moment you cross it. The second is one you cross without noticing, carrying a value that means one thing on this side and something else on the other.

So go back to the question from the top. The line that worked in the browser and crashed on the server: which one is right?

Neither, because "right" isn't something a line of code can be by itself. Correctness isn't stored in the line. It's a relationship between the line and the environment it runs in, and half of that relationship was never written down. You wrote `window.innerWidth`. You did not write "in an environment that has a `window`" because you weren't picturing any other environment. The line was never correct or incorrect. It was correct *against the browser* and incorrect *against Node*, and nothing in the file told you which one it was being judged by.

This is the dependency that doesn't appear in any manifest. You list your packages, you pin your versions, you lock the whole tree so the code that ran on your machine runs the same on everyone else's. And underneath all of it sits the one dependency you never declared, because there's no field for it: the runtime your code assumes. Every reach across the frontier, every `window`, every `setTimeout`, is a line in a contract you didn't know you were signing, with an environment you didn't know you were naming.

You don't get to not sign it. Code always runs somewhere, and somewhere always has a shape. The choice isn't whether to depend on the environment; you can't write a line that doesn't. The choice is whether that dependency lives in your head, invisible until a stack trace drags it into the open, or whether you say it out loud, in the code, where the next person, and the next environment, can see it before it breaks.

The browser was never the default. It was just the room you happened to be standing in when you wrote the line.
