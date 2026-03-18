# Contributing to CS Webring

Thank you for your interest in joining the CS Webring!

## 📋 Submission Rules

### Site Requirements

1. **Relevant Content**: Your site must be related to Computer Science, Data Science, programming, or related technical fields.

2. **Original Content**: Your site should have original content such as:
   - Blog posts
   - Tutorials
   - Project showcases
   - Research papers
   - Technical documentation

3. **Active Site**: Your site should be actively maintained (updated within the last 6 months).

4. **Safe for Work**: No adult content, hate speech, or illegal content.

5. **Working URL**: Your site must be accessible and not behind a paywall.

### Technical Requirements

1. **HTTPS**: Your site should use HTTPS (strongly recommended).

2. **Embed Snippet**: You must add the webring embed snippet to your site in a visible location.

3. **No Broken Links**: Ensure your site doesn't have excessive broken links.

## 🚀 How to Submit

### Step 1: Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### Step 2: Add Your Site

Edit `data/members.json` and add your entry to the array:

```json
{
  "name": "Your Name",
  "year": 2027,
  "website": "https://yoursite.com"
}
```

**Field Guidelines:**
- `name`: Your display name
- `year`: Your expected graduation year (optional, but preferred)
- `website`: Full URL including `https://`

### Step 3: Validate Your Entry

Build the frontend to make sure the JSON is valid and the app still compiles:

```bash
cd frontend
npm run build
```

### Step 4: Submit a Pull Request

1. Commit your changes with a clear message: `Add [Your Site Name] to webring`
2. Push to your fork
3. Open a Pull Request to the main repository
4. Fill out the PR template (if provided)

### Step 5: Add the Embed Snippet

After your PR is merged, add the webring snippet to your site. Replace `https://your-site.com/` with your actual submitted URL (URL-encoded in the `site=` parameter):

```html
<div style="display:flex;align-items:center;gap:8px;">
  <a href="https://cs-webring.pages.dev/go?site=https%3A%2F%2Fyour-site.com%2F&nav=prev">←</a>
  <a href="https://cs-webring.pages.dev/">
    <img src="https://cs-webring.pages.dev/icon.black.svg" alt="CS Webring" style="width:24px;height:auto;opacity:0.8;" />
  </a>
  <a href="https://cs-webring.pages.dev/go?site=https%3A%2F%2Fyour-site.com%2F&nav=next">→</a>
</div>
```

## ✏️ Updating Your Entry

To update your site information:

1. Fork (or update your existing fork)
2. Edit your entry in `data/members.json`
3. Submit a Pull Request with the changes

## 🗑️ Removing Your Site

If you want to leave the webring:

1. Submit a PR removing your entry from `data/members.json`
2. Remove the embed snippet from your site

## 🚫 Grounds for Removal

Sites may be removed for:

- Becoming inactive for over 12 months
- Removing the webring embed snippet
- Adding inappropriate content
- Domain expiration
- Violating our Code of Conduct

## 💬 Questions?

Open an issue on GitHub if you have any questions or concerns.

---

**Happy linking! 🔗**
