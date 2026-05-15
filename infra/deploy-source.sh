#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-sei-ufg-nuvem-ndh}"
REGION="${REGION:-southamerica-east1}"
SERVICE="${SERVICE:-labirintos-revisor}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-labirintos-run-sa}"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
VERTEX_MODEL="${VERTEX_MODEL:-gemini-2.5-pro}"
VERTEX_LOCATION="${VERTEX_LOCATION:-global}"
ALLOW_UNAUTHENTICATED="${ALLOW_UNAUTHENTICATED:-false}"
INGRESS="${INGRESS:-all}"

ACCESS_FLAG="--no-allow-unauthenticated"
if [ "$ALLOW_UNAUTHENTICATED" = "true" ]; then ACCESS_FLAG="--allow-unauthenticated"; fi

gcloud config set project "$PROJECT_ID"

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --service-account "$SERVICE_ACCOUNT_EMAIL" \
  --ingress "$INGRESS" \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 20 \
  --min-instances 0 \
  --max-instances 5 \
  --timeout 300 \
  --set-env-vars "APP_ENV=production,AI_PROVIDER=vertex,GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GOOGLE_CLOUD_LOCATION=${VERTEX_LOCATION},VERTEX_MODEL=${VERTEX_MODEL},MAX_BODY_BYTES=2000000" \
  $ACCESS_FLAG
