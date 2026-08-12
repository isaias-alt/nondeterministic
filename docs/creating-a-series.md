# Creating a series

A series is two things working together: one metadata entry in the `series`
collection, and two or more posts in the `posts` collection that point back
to it. This doc walks through creating one from scratch.

## 1. Pick a slug

Decide the series slug first (kebab-case, e.g. `graph-engineering-101`). Per
`prompt.md` section 4.2, this exact string must appear in **three** places:

1. The folder name: `src/content/posts/series/<slug>/`
2. The `series:` field in every post that belongs to it
3. The metadata file name: `src/content/series/<slug>.md`

Astro doesn't enforce this for you, it's a convention you keep by hand. If
these three drift apart, the series reference breaks silently (the post
won't show up on the series landing page, or the landing page won't find its
posts).

## 2. Create the series metadata file

`src/content/series/<slug>.md`:

```md
---
title: 'Your series title'
description: 'One or two sentences describing the series.'
cover: ./<slug>-cover.jpg
pubDate: 2026-01-01
---
```

- `cover` is **required** for series (unlike posts, where it's optional).
  Place the image file next to this `.md` file and reference it with a
  relative path — Astro's `image()` pipeline processes it.
- `pubDate` is the series' own publish date, independent of its posts' dates.
- The metadata file has no body content below the frontmatter; the landing
  page is built entirely from these fields plus the list of posts.

## 3. Create the posts inside the series

Each part lives in its own folder under
`src/content/posts/series/<slug>/`, same rule as any other post: always a
folder with an `index.md` inside, never a loose file.

```
src/content/posts/series/<slug>/
  01-first-part-name/
    index.md
  02-second-part-name/
    index.md
```

The numeric prefix on the folder name (`01-`, `02-`) is just a convenience
for sorting the folders in your file tree — it does **not** control display
order or the post's URL. Both of those come from other fields:

- **Display order** in the series landing TOC comes from the `order` field
  in frontmatter, ascending.
- **URL slug** comes from the folder name itself, per the project's slug
  rule (section 4.3 of `prompt.md`): the segment containing `index.md`,
  regardless of whether it sits under `_standalone/` or `series/<slug>/`. So
  a post at `posts/series/graph-engineering-101/01-what-is-a-graph/index.md`
  is served at `blog.lucasco.dev/what-is-a-graph`, not nested under
  `/series/...`.

Frontmatter for each part:

```md
---
title: 'Part title'
description: 'One-sentence description shown in the TOC row.'
pubDate: 2026-01-02
draft: false
series: <slug>
order: 1
---

Post body in Markdown.
```

- `series` must match the slug from step 1 exactly.
- `order` must be unique within the series and should increase by 1 per
  part; the landing page sorts by this field, not by folder name or date.
- Leave `draft: true` while you're still writing. Draft posts render in
  `astro dev` (so you can preview them and the series landing) but are
  excluded from the production build and from `/series`'s counts.

## 4. What happens automatically

- The series card on `/series` shows the cover, title, description, and a
  live count of qualifying posts (`getCollection` filtered by `series.id`
  and, in production, by `draft: false`).
- If **every** post in a series is draft (or a series has zero posts), the
  series card and its landing page (`/series/<slug>`) simply don't render in
  production — no broken links, no "0 parts" card. In `astro dev` they still
  render so you can review the whole thing before publishing.
- The series' own metadata entry has no `draft` field. Whether it's "live"
  is entirely determined by whether it has at least one non-draft post.

## 5. Checklist before flipping posts to `draft: false`

- [ ] Slug matches in all three places (folder, `series:` field, metadata
      file name).
- [ ] Series cover image exists and is a real asset (not a placeholder SVG).
- [ ] Every post in the series has a unique `order`.
- [ ] Post `pubDate`s make sense relative to each other (the blog index still
      sorts everything, series or not, by `pubDate` — not by `order`).
- [ ] Reviewed both `/series` and `/series/<slug>` in `astro dev` before
      setting `draft: false`.
