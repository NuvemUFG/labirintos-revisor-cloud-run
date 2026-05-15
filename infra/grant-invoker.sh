#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-sei-ufg-nuvem-ndh}"
REGION="${REGION:-southamerica-east1}"
SERVICE="${SERVICE:-labirintos-revisor}"
MEMBER="${MEMBER:?Set MEMBER, for example user:erica@ufg.br or group:ndh@ufg.br}"

gcloud config set project "$PROJECT_ID"
gcloud run services add-iam-policy-binding "$SERVICE" \
  --region "$REGION" \
  --member "$MEMBER" \
  --role roles/run.invoker
