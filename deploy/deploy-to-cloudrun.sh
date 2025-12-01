#!/bin/bash
set -e

PROJECT_ID="librechat-479911"
REGION="us-central1"
SERVICE_NAME="librechat"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/librechat-repo/${SERVICE_NAME}:latest"

echo "🔨 Building with Cloud Build..."
gcloud builds submit --tag ${IMAGE}

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image=${IMAGE} \
    --region=${REGION} \
    --platform=managed \
    --allow-unauthenticated \
    --port=3080 \
    --memory=2Gi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=4 \
    --timeout=3600 \
    --session-affinity \
    --execution-environment=gen2 \
    --set-env-vars="ALLOW_REGISTRATION=false,ALLOW_PASSWORD_RESET=false,ALLOW_EMAIL_LOGIN=true" \
    --set-secrets="MONGO_URI=mongo-uri:latest,JWT_SECRET=jwt-secret:latest,JWT_REFRESH_SECRET=jwt-refresh-secret:latest"

URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
echo "✅ Deployed! URL: ${URL}"