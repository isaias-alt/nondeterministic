---
title: "Two Exabytes Is Not the Problem"
description: "Why a game launch is a flow problem disguised as a capacity problem"
pubDate: "2026-11-25"
# updatedDate: "2026-08-27"
draft: true
# cover: (optional, no cover image for this post)
# series: (optional, this post is standalone, not part of a series)
# order: (optional, only used when `series` is set)
---

```js
const urls = Array.from(
  { length: 10_000 },
  (_, i) => `https://api.example.com/item/${i}`,
);

// sequential: safe, but slow
for (const url of urls) {
  await fetch(url);
}

// parallel: fast, but floods
await Promise.all(urls.map((url) => fetch(url)));
```

The first version is too slow. The second version can take down the service. Same ten thousand requests. Same total work. The only thing that changed is the shape of the arrival.

You've probably fixed this before. You didn't add a bigger server. You added a concurrency limit, a queue, a batch. You changed when the requests leave, not how many there are. The total stayed the same. The curve changed.

Now scale that line of code to a game launch.

Take GTA 6: ten million copies on day one, around 200 GB each. Multiply it out:

```text
10.000.000 copies × 200 GB = 2.000.000.000 GB
2.000.000.000 GB = 2.000.000 TB = 2.000 PB = 2 EB
```

Two exabytes. That's the number everyone calculates. It's also the wrong number.

Two exabytes is a quantity. Quantities don't take down systems. Rates do.

Spread those two exabytes over the first 24 hours and you get:

```text
2.000.000 TB / 86.400 s ≈ 23.15 TB/s
23.15 TB/s × 8 ≈ 185 Tbps
```

That's already a lot. But the traffic isn't spread evenly. A launch is front-loaded: most people try to download the moment the game unlocks. If half the downloads happen in the first four hours:

```text
1.000.000 TB / 14.400 s ≈ 69.44 TB/s
69.44 TB/s × 8 ≈ 555 Tbps
```

And if the launch is a record, the number of copies could be 2 or 2.5 times that estimate. Now the number is not a quantity. It's a rate, and it's no longer in the same order of magnitude as a single company's capacity. Akamai, one of the biggest CDNs in gaming, reported peaks near 396 Tbps in 2025, with a capacity of more than 1.000 Tbps. The 555 Tbps estimate is already more than half of that. The record scenario is above it. No single CDN carries this alone. That's why the architecture is plural by default.

This is the first thing the launch teaches: a system sized for the average collapses at the peak. The average is a comfortable number. The peak is the one that arrives.

Every technique in the launch playbook is a way of changing the shape of that curve. Not the size of the total. The shape of the arrival.

The download itself is the simpler part, because it's the same file for everyone. That's what makes caching possible. A CDN doesn't reduce the number of bytes; it puts a copy of the bytes closer to the user. The file is stored in many places, and the console downloads from the nearest one. Each location is a point of presence, a PoP. The total is unchanged. The distance each byte travels is not.

The same move goes further. A CDN can partner with an ISP and put servers inside the ISP's network, past the peering link, the boundary between two networks. The download then resolves inside the ISP without crossing the public internet. The bytes still exist; they just don't have to travel as far. This only makes sense for content that is extremely popular, because you're paying to put a copy of the same file in a lot of places. GTA 6 is exactly that content.

Then there's the failure case. If you depend on one CDN, you have a single point of failure: if it goes down or saturates, the store is blocked. So you use several CDNs in parallel. A request router decides which one each client should use, based on region, configured weights, and real-time performance. The heavy traffic doesn't pass through the router; the router only tells the console where to go, and the console downloads directly from the chosen CDN. The download is split into chunks, so a chunk can come from one CDN and the next from another. If one path degrades, the next chunk takes another. The bytes are the same. The paths are not.

Caching changes where the flow goes. The next set of techniques changes when it goes.

Pre-downloads are the clearest example. If you pre-order the game, you can download the files days before launch. The game stays locked until the official hour, but the bytes are already on your console. A massive peak becomes a sustained load over the days before. The release date still synchronizes the players. The download doesn't have to.

Staggered releases do the same thing across geography. Instead of unlocking everywhere at the same instant, you unlock at midnight local time, or by country. The peak becomes a wave that travels around the world instead of a spike that hits everywhere at once. The trade-off is business and enforcement: players try to fake their region to play early, and blocking that strictly can punish people who are actually traveling. The infrastructure wants a smooth curve. The business wants a single, simultaneous moment. The two are pulling on the same graph.

Throttling is the blunt version. You put a ceiling on how much bandwidth or how many requests a client can use, so the system never crosses the limit where it collapses. The download takes longer, but it keeps moving. A lower speed with continuous movement beats a collapse. It's the same logic as an audio limiter: you lower the peak so the signal doesn't clip, and the song still plays.

Partial downloads reorder the flow instead of slowing it. The game marks the critical files first, so it becomes playable at 30%. The rest loads in the background, and that background traffic can be throttled more aggressively, leaving bandwidth for the players who are just starting. The total is the same. The order is not.

There's one more shape to change: the buffer. When arrivals outpace the service rate, you put a queue between them. The queue absorbs the difference, and the system keeps serving at its own pace instead of collapsing.

The arithmetic is simple and brutal. Suppose a database can handle 100 concurrent connections, with an average query latency of 10 milliseconds. Its throughput is:

```text
100 connections / 0.01 s = 10.000 queries per second
```

Now a peak arrives at 15.000 requests per second and lasts ten seconds. The database serves 10.000 per second and queues the other 5.000. After ten seconds, 50.000 requests are waiting. If the arrivals stopped right there, draining the queue at capacity would take five seconds:

```text
50.000 / 10.000 = 5 s
```

But the arrivals don't stop. If they keep coming at 15.000 per second, the queue doesn't drain. It grows. The wait grows with it. This is the part people miss about queues: they don't cancel a peak, they store it. They buy you time, and they only pay it back if the arrival rate falls below the service rate. If it doesn't, the queue is just a slower way to fail.

That's why a queue is never enough on its own. You also need backpressure: retries with exponential backoff, jitter, a `Retry-After` header, rate limiting, circuit breakers. The client has to slow down, and the server has to enforce it, because you can't trust the client to respect a pause it can't see. The queue is the buffer. The backpressure is the valve.

Everything so far has been the static layer. The same file for everyone. The CDN is a copy machine, and copy machines scale because the bytes don't care who is asking. That's why the download is the part that can be made to look easy.

The moment the request depends on who you are, the copy machine stops. Did you buy the game? Is this your account? Does this purchase commit? Those questions can't be answered by a copy of the file at the edge. They need a source of truth, and the source of truth has to agree with itself.

This is the hard dependency. The download can finish perfectly and the game still won't start, because the service that checks whether you own it is down. Or because the developer's login servers are down. Diablo III's Error 37 is the canonical version: the game was installed, the servers were not letting anyone in. The static flow was fine. The stateful core was the failure.

The flow frame explains the static layer. It breaks here. You can't cache a permission the way you cache a file. You can cache it for a while, but the cache has to expire, and when it does, the answer has to be correct. You can queue the check, but now the queue is in the critical path: the player can't start until the check resolves. You can throttle the download, but you can't throttle a login the same way, because the user isn't waiting for bytes; they're waiting to play.

The design principle is to shrink the hard core. Almost everything should be a soft dependency: if telemetry fails, the game still runs; if the news feed fails, the game still runs; if the friends list fails, the game still runs. The hard dependencies are the few things that must be correct for the game to start at all: entitlement, login, the purchase itself. Those get the redundancy, the strong consistency, and the engineering attention. The rest gets a queue and a shrug.

This is also where the database choice stops being an abstract debate. A NoSQL store can scale horizontally, but it makes you design around access patterns; query by user and by game, and you duplicate the data into views that take time to agree. That eventual consistency is fine for a social feed. It's not fine for ownership. Sony moved its entitlement data from Cassandra to Google Spanner for exactly this reason: horizontal scale with strong consistency, and a reported 91% reduction in storage because it no longer had to duplicate the data across views. The stateful layer is not a flow problem. It's a truth problem.

Go back to the ten thousand URLs.

The fix wasn't a bigger server. It was a smaller number of requests in flight at once. A concurrency limit. A queue. A batch. The total stayed the same. The shape changed.

A launch is the same fix at the scale of a planet. Two exabytes is not the problem. The problem is the derivative: the rate at which the crowd arrives. And the crowd arrives at that rate because the launch told it to. A release date is a synchronization technology. The infrastructure is a desynchronization technology. Pre-downloads, staggered releases, throttling, partial downloads, queues, batches: they are all ways of breaking the same promise without the player noticing. The game still feels like it starts at the same moment for everyone. The bytes just didn't.

The number that matters isn't the total. It's the shape of the curve. And the curve is made of people who all decided to show up at the same minute.

**Sources**

- [Akamai, "2025 Impact Report" (peak traffic event in 2025: 395.84 Tbps)](https://www.akamai.com/content/dam/site/en/documents/research-paper/2026/2025-impact-report.pdf)
- [Akamai, "Secure Every AI Interaction" (over 1,000 Tbps of capacity)](https://www.akamai.com/site/es/documents/brief/2023/akamai-prolexic-product-brief.pdf)
- [Google Cloud, "Game on with Spanner: How Playstation achieves global scale with 91% less storage, 50% lower costs" (archived)](https://web.archive.org/web/20260309162044/https://cloud.google.com/blog/products/gaming/sony-interactive-playstation-games-library-spanner-heroes)
- [GDC Vault, "Leveling Up with Google Cloud: PlayStation's Global Migration to Spanner" (Presented by Google Cloud)](https://gdcvault.com/play/1035649/Leveling-Up-with-Google-Cloud)
