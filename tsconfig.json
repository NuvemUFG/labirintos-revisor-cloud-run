#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-sei-ufg-nuvem-ndh}"
REGION="${REGION:-southamerica-east1}"
REPOSITORY="${REPOSITORY:-labirintos-containers}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-labirintos-run-sa}"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

printf '[1/6] Project: %s\n' "$PROJECT_ID"
gcloud config set project "$PROJECT_ID"

printf '[2/6] Enabling APIs...\n'
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  iam.googleapis.com \
  serviceusage.googleapis.com

printf '[3/6] Creating Artifact Registry repository if needed...\n'
if ! gcloud artifacts repositories describe "$REPOSITORY" --location "$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPOSITORY" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Containers for Labirintos Revisor"
fi

printf '[4/6] Creating Cloud Run service account if needed...\n'
if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
    --display-name="Labirintos Cloud Run runtime"
fi

printf '[5/6] Granting runtime roles...\n'
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/aiplatform.user" \
  --quiet >/dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet >/dev/null

printf '[6/6] Done. Runtime service account: %s\n' "$SERVICE_ACCOUNT_EMAIL"
printf 'Next: connect repository in Cloud Run or run infra/deploy-source.sh\n'
