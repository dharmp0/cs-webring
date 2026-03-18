![active development](https://img.shields.io/badge/active%20dev-yes-brightgreen.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Devansh015/cs-webring.svg)

# CS Webring
<img alt="cs-webring icon" src="./assets/logo/logo_bg.svg" width="100" height="100">

A webring for Computer Science (CS) students at our university.

**Live Site:** [cs-webring.pages.dev](https://cs-webring.pages.dev)

---

## What's a webring?

A webring is a group of websites linked together in a circular manner, centered around a common theme. They were popular in the 90s as a discovery mechanism. The CS Webring connects personal sites and portfolios of current and former CS students, making them more discoverable.

---

## How it works

All navigation logic lives on the central webring site. Member sites only need a small HTML snippet — no JavaScript widget or external script required.

When a visitor clicks **←** or **→** on a member site, they are taken to:

```
https://cs-webring.pages.dev/go?site=<encoded-url>&nav=prev|next|random
```

The central router (`/go`) reads the query parameters, looks up the site in `data/members.json` by hostname, computes the previous/next member with wraparound, and redirects in the same tab.

---

## How do I join?

### Step 1: Submit a Pull Request

1. Fork this repository
2. Add your site to `data/members.json`:

```json
{
  "name": "Your Name",
  "year": 2027,
  "website": "https://yoursite.com"
}
```

3. Open a [pull request](https://github.com/Devansh015/cs-webring/pulls) with:
   - Your full name
   - Cohort/graduation year
   - Full website URL
   - Link to verify identity (GitHub, LinkedIn, etc.)

Your PR will be approved if you meet all requirements and there's no inappropriate content.

### Step 2: Add the embed snippet to your site

After your PR is merged, paste one of the snippets below into your site. **Replace `https://your-site.com/` with the exact URL you submitted**, URL-encoded in the `site=` parameter.

#### HTML

```html
<div style="display:flex;align-items:center;gap:8px;">
  <a href="https://cs-webring.pages.dev/go?site=https%3A%2F%2Fyour-site.com%2F&nav=prev">←</a>
  <a href="https://cs-webring.pages.dev/">
    <img
      src="https://cs-webring.pages.dev/icon.black.svg"
      alt="CS Webring"
      style="width:24px;height:auto;opacity:0.8;"
    />
  </a>
  <a href="https://cs-webring.pages.dev/go?site=https%3A%2F%2Fyour-site.com%2F&nav=next">→</a>
</div>
```

#### JSX (React)

```jsx
<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <a href="https://cs-webring.pages.dev/go?site=https%3A%2F%2Fyour-site.com%2F&nav=prev">←</a>
  <a href="https://cs-webring.pages.dev/">
    <img
      src="https://cs-webring.pages.dev/icon.black.svg"
      alt="CS Webring"
      style={{ width: "24px", height: "auto", opacity: 0.8 }}
    />
  </a>
  <a href="https://cs-webring.pages.dev/go?site=https%3A%2F%2Fyour-site.com%2F&nav=next">→</a>
</div>
```

> **Important:** The `site=` value must be URL-encoded. For example, `https://your-site.com/` becomes `https%3A%2F%2Fyour-site.com%2F`. The router matches sites by hostname, so minor trailing-slash differences won't break matching, but the URL must be encoded correctly in the `site=` parameter.

---

## Central router details

The router lives at [`/go`](frontend/public/go/index.html) and accepts these query parameters:

| Parameter | Required | Values | Description |
|-----------|----------|--------|-------------|
| `site`    | Yes      | URL-encoded member URL | The current member site |
| `nav`     | Yes      | `prev`, `next`, `random` | Navigation direction |

**Behavior:**
- Matches the `site` parameter against `data/members.json` entries by hostname
- Computes prev/next with circular wraparound
- Redirects in the same tab via `window.location.replace()`
- Shows a friendly error message for invalid or missing parameters

---

## Data format

`data/members.json` is the single source of truth. It is a JSON array of member objects:

```json
[
  {
    "name": "Your Name",
    "year": 2027,
    "website": "https://yoursite.com"
  }
]
```

| Field     | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `name`    | string | Yes      | Display name |
| `year`    | number | No       | Expected graduation year |
| `website` | string | Yes      | Full URL with `https://` |

---

## Deploy

This project is configured for deployment on **Vercel**.

### Quick Deploy
```bash
npm install -g vercel
vercel --prod
```

### Full Setup
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment instructions.

### Local Development
```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Set `PORT=3001` in `backend/.env` for local development so the join flow matches the frontend's local API target.

For convenience, use the included deployment commands:
```bash
source vercel-commands.sh
help                    # Show available commands
dev-all                 # Start both backend and frontend
vercel-deploy           # Deploy to production
```

---

## Migration from the old widget

If you were previously using the `<script>` widget (`webring.js` / `webring.min.js`), you can remove it entirely and replace it with the static HTML embed snippet above. The old widget fetched member data and computed navigation on each member site — that logic now runs on the central site's `/go` router instead.

**To migrate:**
1. Remove the old `<script>` and `<link>` tags for `webring.js` and `themes.css`
2. Remove the `<div id="cs-webring"></div>` container
3. Paste the new HTML embed snippet (see [Step 2](#step-2-add-the-embed-snippet-to-your-site) above)
4. Replace `https://your-site.com/` with your actual site URL (URL-encoded)

---

**Authors:** Devansh Jain, Yash Soni
