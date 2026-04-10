# PubMed iCite Chat Analyzer - Automation

project_id := "[YOUR_PROJECT_ID]"
region := "us-central1"
image_name := "icite-analyzer"

# Start the development server
dev:
    npm run dev

# Build the frontend for production
build:
    npm run build

# Run type checking
lint:
    npm run lint

# Build the Docker image locally
docker-build:
    docker build -t {{image_name}} .

# Build and push to Google Cloud Build
gcp-build:
    gcloud builds submit --tag gcr.io/{{project_id}}/{{image_name}}

# Deploy to Google Cloud Run
deploy:
    gcloud run deploy {{image_name}} \
        --image gcr.io/{{project_id}}/{{image_name}} \
        --platform managed \
        --region {{region}} \
        --allow-unauthenticated \
        --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY

# Full build and deploy cycle
all: lint build gcp-build deploy
