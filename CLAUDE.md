# Prosolar Mechanics — Site Notes

Project documentation for the prosolarmechanics.com rebuild. Keep this updated as decisions are made.

---

## Hosting & Deployment

- **Hosting:** Vercel (free tier)
- **Repo:** `https://github.com/alexsaville-design/prosolarmechanics` (branch: `main`)
- **Auto-deploy:** every push to `main` triggers a Vercel rebuild and deploy
- **Domain:** purchased on Namecheap, pointed to Vercel
- **Framework:** Astro 4.x (static site generator)

Every content change requires a `git push origin main` to go live.

---

## Project Folder

Working files live at:
`/Users/alexsaville/Documents/Claude/Projects/Prosolar Mechanics/`

Archive of the original site (2001 era) lives at:
`/Users/alexsaville/Documents/@FALL 2021/Prosolar Mechanics/Prosolar Mechanicsb/`

Additional archive folders:
- `/Users/alexsaville/Documents/@Fall 2020/ProsolarMechanics/`
- `/Users/alexsaville/Documents/@Fall 2020/prosolarmechanics.com/`

---

## Site Structure

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Homepage |
| `/log` | `src/pages/log.astro` | Log index (archive entries + new Substack posts) |
| `/log/[1–11, 1.5, 1.75, 51, 8.5]` | `src/pages/log/*.astro` | Individual archive log entries |
| `/log/[slug]` | `src/pages/log/[slug].astro` | Dynamic route for Substack-synced entries |
| `/sound` | `src/pages/sound.astro` | Bandcamp links for three releases |
| `/press` | `src/pages/press.astro` | Press archive |
| `/dates` | `src/pages/dates.astro` | Show dates |
| `/manifesto` | `src/pages/manifesto.astro` | Band manifesto (Series 6498a) |
| `/operations-manual` | `src/pages/operations-manual.astro` | Full expanded operations manual (Series 6498a + 101798a + 102499a) |
| `/lyrics` | `src/pages/lyrics.astro` | Lyrics (linked from sound page) |
| `/contact` | `src/pages/contact.astro` | Contact (prosolarmechanics@gmail.com) |

Pages not built yet: member pages (alex, amy, mike, gus), gear page. Decision pending.

---

## Content: Substack → Site Sync

New writing from Amy goes to the band Substack at `prosolarmechanics.substack.com`. It flows to the site automatically via a Make.com scenario:

**Make.com scenario:** Watch RSS → GitHub API Call

1. **Watch RSS** module polls `https://prosolarmechanics.substack.com/feed`
2. **GitHub** module fires a PUT to the GitHub Contents API:
   - URL: `/repos/alexsaville-design/prosolarmechanics/contents/src/content/log/[slug].md`
   - Filename derived from: `last(split(2.link; /))` — takes the final path segment of the Substack post URL
   - Creates a markdown file with frontmatter: `title`, `date`, `substackUrl`
   - Body: `content:encoded` from RSS (full HTML of the post)
3. The new file in `main` triggers a Vercel rebuild automatically
4. Post appears in the "new transmissions" section of `/log`

**Content collection schema** (`src/content/config.ts`):
```ts
title: z.string()
date: z.coerce.date()
substackUrl: z.string().url().optional()
description: z.string().optional()
```

**If a post doesn't appear automatically:** check Make.com execution history for errors, verify the scenario is active and scheduled, and check whether the RSS "last seen" cursor is past the post in question. As a manual fallback, drop a `.md` file into `src/content/log/` with proper frontmatter and push.

---

## Archive Log Entry Numbering

The archive log uses a decimal numbering system. All of these are valid routes:

`1, 1.5, 1.75, 2, 3, 4, 5, 51, 6, 7, 8, 8.5, 9, 10, 11`

Part 51 is the special Boonefest 2000 edition (out of sequence by design).

---

## Mechanic IDs

Log entries carry a `mechanic id:` in their header. **These are not real birthdates.** IDs in use:

- `10001001-A` — Alex's mechanic ID (class A)
- `14711149335-A` — Amy's mechanic ID (class A); encodes "AMY J SAVILLE" via 1–9 rotation cipher (A=1…I=9, J=1…R=9, S=1…Z=8)

---

## Design System

- **Background:** `#080808`
- **Primary accent (gold):** `#c9a227`
- **Secondary accent (teal):** `#4ecdc4`
- **Body text:** `#ccc` / `#999`
- **Hero text:** `#f0ece0`
- **Typography:** Georgia serif for titles and band name; Verdana sans-serif for body
- **Identity:** all-lowercase throughout
- **Tagline:** "sound breaking the monotony of space" (confirmed by Amy)

---

## Releases (Sound Page)

| Title | Label | Bandcamp |
|---|---|---|
| The Lincoln Hill Demo | Powerbunny 4x4 | `powerbunny4x4.bandcamp.com/album/prosolar-mechanics-lincoln-hill-demo` |
| Urban Development Series Vol. 4 | Land Speed Record | `landspeedrecord.bandcamp.com/album/urban-development-series-vol-4` |
| Turn On | Powerbunny 4x4 | `powerbunny4x4.bandcamp.com/album/prosolar-mechanics-turn-on` |

---

## Content Decisions (Do Not Revisit)

- **Cats page:** do not build. None of those companions are still alive.
- **Halloween entry (Amy, Oct 31 tour diary):** redacted. Do not publish.
- **Daily tour diary stubs (Oct 28 – Nov 16, 2001):** all identical placeholder files with no real content. Not published. Covered by the editorial note in log/8.5.

---

## Git Workflow

Always provide the full sequence:

```bash
cd "/Users/alexsaville/Documents/Claude/Projects/Prosolar Mechanics"
git add [files]
git commit -m "[message]"
git push origin main
```

---

## Favicon

- `public/favicon.ico` — multi-size (16×16, 32×32, 48×48), generated from pmxsubstackimg.png via Pillow
- `public/favicon.png` — 64×64, same source
- `public/pmxsubstackimg.png` — source image (actually a WebP despite .png extension — Pillow handles it)
- Browser caching on favicons is aggressive; hard refresh (Cmd+Shift+R) needed after deploy to see changes

---

## Operations Manual vs. Archive Manifesto

The live `operations-manual.astro` is a substantially expanded revision of the original `manifesto.htm` from the archive. The archive version (Series 6498a only) is shorter and sparser. All italic interlude blocks, the "prefrontal cortex" passage, the "you cannot fight the system" opening in 2-3, and the graphic novel reframing in 2-4 are additions not present in the archive. The live site version is the correct/intentional one.
