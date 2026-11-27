# Test Plan Generator

Enter a Jira issue ID and get a test plan back, written to the template in `02_Plan/TestPlan_Template.md`.

- **Frontend:** React + Vite (`src/frontend`)
- **Backend:** Node.js + Express (`src/backend`). Jira and LLM calls happen only here.

## Prerequisites
- Node.js 18+ (tested with 24.x)
- A Jira Cloud account with an API token
- An LLM: a Groq API key **or** a local Ollama install with at least one model pulled

## Configuration
The backend reads `Test_Planning_AI_Agent/.env`, two folders above this one (`src/backend/config.js`). See `.env.example` for the keys:

| Key | Required | Notes |
|---|---|---|
| `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` | yes | Jira Cloud → REST v3. Other hosts → REST v2 |
| `GROQ_API_KEY` | for Groq | If this is set, Groq is the default provider |
| `GROQ_MODEL` | no | Default `openai/gpt-oss-120b` |
| `OLLAMA_URL` / `OLLAMA_MODEL` | no | Defaults to `http://localhost:11434` and the first installed model (alphabetical) |
| `PORT` | no | Default `3001` |

Secrets never leave the backend. The API returns only flags such as `jiraTokenSet: true`. Changes made on the Settings page are kept in server memory until the server restarts. To make them permanent, edit `.env`.

## Run
```bash
cd 03_Implementation
npm run setup    # install backend + frontend, build frontend
npm start        # http://localhost:3001
npm test         # backend unit tests (mocked Jira/LLM)
```
Dev mode with hot reload: run `npm run dev:backend` and `npm run dev:frontend` in two terminals, then open http://localhost:5173.

## Deploy (Vercel)
Live at https://rohanm-testplanagent.vercel.app (project `rohanm-testplanagent`).
- The API is stateless. `api/index.js` wraps the Express app as a serverless function, and the React build is served as static files (`vercel.json`).
- Default credentials are stored as encrypted Vercel env vars (`JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `GROQ_API_KEY`), not in the code.
- Users can override them on the Settings page by typing values or loading a `.env` file. Those values stay in page memory only and are sent with each request.
- The server's Jira token is only ever sent to the server's own Jira URL.
- The hosted app can't reach a local Ollama, so use Groq there.
- Redeploy: `npm run sync-template && npx vercel deploy --prod` (this copies the template from `02_Plan` into `src/backend`).
- ⚠️ The site is public. Anyone with the URL can read your Jira issues through it and use your Groq quota.

## Usage
1. Open **Settings**. Check the Jira fields, then click **Test Connection**. Pick Ollama or Groq and click **Test Local LLM** or **Test Groq.com**.
2. On the **Main page**, type an issue ID (e.g. `PROJ-123`) in the prompt box and click **Generate**.
3. The plan appears in the reply box, linked to its source issue. It is an AI draft and must be reviewed.

## How generation works
- The backend reads the issue with GET requests only (`fields=*all&expand=names`). It never writes to Jira.
- Acceptance criteria come from a field named "Acceptance Criteria". If there is no such field, they come from an "Acceptance Criteria" heading in the description.
- The prompt sends the template and the Jira data, with the Jira data wrapped in `<jira_source>` and marked as data, not instructions. It also requires:
  - the exact template sections
  - `Insufficient information to determine.` wherever the source has no answer
  - `(Proposed)` at the start of each scenario
  - `Inference (low confidence):` on anything inferred
- Generation runs at `temperature: 0` with `seed: 42`. Output can still vary slightly between runs, because providers don't guarantee identical results.
- The backend compares the result's headings with the template's. Any missing sections are shown as a warning.

## Verification
- **Mocked** (`npm test`, 6/6 pass): issue-key validation, ADF conversion, acceptance-criteria extraction, issue mapping, template-section check, empty-response handling.
- **Live (2026-11-22)**:
  - Backend started and loaded `.env`. The settings API returned no secrets.
  - Jira, Groq and Ollama connection tests passed.
  - Error responses were correct: invalid ID → 400, missing issue → 404, bad JSON → 400.
  - Full generation for a real issue through Groq (`openai/gpt-oss-120b`) returned all 8 template sections.
- **Not verified live**: full generation through Ollama, and Jira 401/403 responses (no bad-credential or restricted-issue cases were tested).

## Known limitations
- Settings changes are lost when the server restarts.
- The only planning material is the template. Resource allocation and timelines are filled from Jira sprint data when it exists; otherwise they read "Insufficient information to determine."
- Small local models (e.g. `gemma3:1b`) may not follow the template well. Check the missing-sections warning.
