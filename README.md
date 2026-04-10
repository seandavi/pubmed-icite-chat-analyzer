# PubMed iCite Chat Analyzer

A full-stack application that fetches publication data from the NIH iCite API and allows users to ask questions about the data using a secure, server-side Gemini-powered chatbot.

## Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express (serving as an API proxy and Vite middleware)
- **AI**: Google Gemini 3 Flash (via `@google/genai`)
- **Deployment**: Containerized with Docker, ready for Google Cloud Run

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Google Cloud SDK](https://cloud.google.com/sdk) (for deployment)
- [Just](https://github.com/casey/just) (optional, for automation)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Deployment to Google Cloud Run

This app is containerized and optimized for Cloud Run.

### 1. Configure Google Cloud
```bash
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
```

### 2. Build and Push Image
Using Google Cloud Build:
```bash
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/icite-analyzer
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy icite-analyzer \
  --image gcr.io/[YOUR_PROJECT_ID]/icite-analyzer \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=[YOUR_API_KEY]
```

## Automation with Just

If you have `just` installed, you can use the following commands:

- `just dev`: Start the development server
- `just build`: Build the frontend for production
- `just lint`: Run type checking
- `just deploy`: Build and deploy to Cloud Run (requires configuration in justfile)

## Security Note

This application uses a full-stack architecture to ensure that your `GEMINI_API_KEY` is never exposed to the client-side browser. All AI processing happens on the Express backend.
