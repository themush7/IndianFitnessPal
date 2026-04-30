# PlainTalk Macros

Type any Indian meal in plain language. Get instant macro breakdown.

**Live demo:** [your-url.vercel.app]

---

## Deploy in 10 minutes

### Step 1: Get your Anthropic API key

Go to https://console.anthropic.com → API Keys → Create Key.
Copy it. You'll need it in Step 4.

### Step 2: Push this folder to GitHub

```bash
cd plaintalk-macros
git init
git add .
git commit -m "initial commit"
```

Create a new repo on github.com, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/plaintalk-macros.git
git push -u origin main
```

### Step 3: Connect to Vercel

1. Go to https://vercel.com and sign in (free account)
2. Click "Add New Project"
3. Import your GitHub repo
4. Leave all build settings as default — Vercel will detect it automatically
5. Click "Deploy" (it will fail — that's expected, no API key yet)

### Step 4: Add your API key as an environment variable

1. Go to your Vercel project → Settings → Environment Variables
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your key from Step 1)
   - **Environment:** Production + Preview + Development (check all three)
3. Save

### Step 5: Redeploy

Go to Deployments → click the three dots on your latest deployment → Redeploy.

That's it. Your app is live.

---

## File structure

```
plaintalk-macros/
├── index.html        Frontend — single file, no dependencies
├── api/
│   └── analyze.js    Vercel serverless function — API proxy + system prompt
├── vercel.json       Routing config
└── README.md         This file
```

## How it works

1. User types a meal in `index.html`
2. Frontend calls `/api/analyze` (your Vercel serverless function)
3. Serverless function adds the API key and calls Anthropic API
4. Claude returns structured JSON with macros
5. Frontend renders the result

Your API key never touches the browser. It only lives in Vercel's environment variables.

## Costs

Claude Haiku is ~$0.25 per million input tokens.
One macro analysis call = ~1,500 tokens.
1,000 analyses = ~$0.38. Essentially free at any scale you'll see in V1.

## V2 roadmap

- Shareable Instagram story card (image output)
- Protein gap closer: "You got 28g. Here's how to close to 150g."
- Weekly discipline score card
- Set personal targets for context

---

Built by Sarthak using Claude AI.
