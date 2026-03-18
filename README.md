![active development](https://img.shields.io/badge/active%20dev-yes-brightgreen.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Devansh015/cs-webring.svg)

# 🔗 CS Webring - WIP
<img alt="cs-webring icon" src="./assets/logo/logo_bg.svg" width="100" height="100">

💻 A webring for Computer Science (CS) students at our university.

🌐 **Live Site:** [cs-webring.vercel.app](https://cs-webring.vercel.app)

🔵 [What's a webring?](#whats-a-webring) / [How do I join?](#how-do-i-join) / [Embed the Widget](#embed-the-widget) / [Deploy](#deploy) / [Credits](#credits)

---

## What's a webring?

A webring is a group of websites linked together in a circular manner, centered around a common theme. They were popular in the 90s as a discovery mechanism. The CS Webring connects personal sites and portfolios of current and former CS students, making them more discoverable.

---

## How do I join?

### Step 1: Submit a Pull Request

1. Fork this repository
2. Add your site to `data/members.json`:

```json
{
  "name": "Your Name",
  "url": "https://yoursite.com",
  "cohort": "2027"
}
```

3. Open a [pull request](https://github.com/Devansh015/cs-webring/pulls) with:
   - Your full name
   - Cohort/graduation year
   - Full website URL
   - Link to verify identity (GitHub, LinkedIn, etc.)

Your PR will be approved if you meet all requirements and there's no inappropriate content.

### Step 2: Add the Widget to Your Site (Encouraged!)

Once approved, add the webring widget to your site so visitors can discover other members.

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

### Widget Themes

Choose from 5 built-in themes:

| Theme | Description |
|-------|-------------|
| `default` | Clean, light theme |
| `dark` | Dark mode friendly |
| `minimal` | Borderless, adapts to your styles |
| `neon` | Cyberpunk vibes |
| `retro` | 90s nostalgia |

```html
<script>
  new WebringWidget({ theme: 'dark' });
</script>
```

### Custom Container

```html
<div id="my-webring-spot"></div>
<script>
  new WebringWidget({ 
    theme: 'minimal',
    container: '#my-webring-spot'
  });
</script>
```

---

---

**Authors:** Devansh Jain, Yash Soni
