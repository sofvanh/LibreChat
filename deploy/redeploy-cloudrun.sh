#!/bin/bash
set -e

PROJECT_ID="librechat-479911"
REGION="us-central1"
SERVICE_NAME="librechat"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/librechat-repo/${SERVICE_NAME}:latest"

echo "🚀 Redeploying existing build to Cloud Run..."
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
    --env-vars-file=deploy/env-vars.yaml \
    --set-secrets="MONGO_URI=mongo-uri:latest,\
                    JWT_SECRET=jwt-secret:latest,\
                    JWT_REFRESH_SECRET=jwt-refresh-secret:latest,\
                    CREDS_KEY=creds-key:latest,\
                    CREDS_IV=creds-iv:latest"

URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
echo "✅ Redeployed! URL: ${URL}"

