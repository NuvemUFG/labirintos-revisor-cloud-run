apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: labirintos-revisor
  labels:
    app: labirintos-revisor
    project: labirintos-de-punicao
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "0"
        autoscaling.knative.dev/maxScale: "5"
        run.googleapis.com/startup-cpu-boost: "true"
    spec:
      serviceAccountName: labirintos-run-sa@sei-ufg-nuvem-ndh.iam.gserviceaccount.com
      containerConcurrency: 20
      timeoutSeconds: 300
      containers:
        - image: southamerica-east1-docker.pkg.dev/sei-ufg-nuvem-ndh/labirintos-containers/labirintos-revisor:IMAGE_TAG
          ports:
            - name: http1
              containerPort: 8080
          resources:
            limits:
              cpu: "1"
              memory: 1Gi
          env:
            - name: APP_ENV
              value: production
            - name: AI_PROVIDER
              value: vertex
            - name: GOOGLE_CLOUD_PROJECT
              value: sei-ufg-nuvem-ndh
            - name: GOOGLE_CLOUD_LOCATION
              value: global
            - name: VERTEX_MODEL
              value: gemini-2.5-pro
            - name: MAX_BODY_BYTES
              value: "2000000"
            - name: AGENTIC_MULTI_CALLS
              value: "true"
            - name: AGENTIC_MAX_STEPS
              value: "8"
