## Deployment instructions (@sofvanh custom branch)

Prerequisites: Setup `gcloud` in terminal

### Deployment stack

- Database running on MongoDB Atlas
- Deployment running on Google Cloud Run
  - With Cloud Build and Artifact Registry, and Secret Manager

### How to create a new account

1. Edit `.env` file so that `MONGO_URI` is the address to the production MongoDB database
   - You can find this in the Secret Manager in Google Cloud dashboard
2. Run `npm run create-user`

### How to update

1. Merge update to branch `prod`
2. Run `./deploy/deploy-to-cloudrun.sh`

To get the app up-to-date with upstream ([danny-avila/librechat](https://github.com/danny-avila/LibreChat)):

1. **sync `main` with upstream** by selecting **'Sync fork'** in the [GitHub page of `main`](https://github.com/sofvanh/LibreChat)
2. Merge `main` to `prod`
3. Run `./deploy/deploy-to-cloudrun.sh`

### Updating env vars or secrets only

```
gcloud run services update librechat \
    --project=librechat-479911 \
    --region=us-central1 \
    --update-env-vars="KEY1=value,KEY2=value"
```

```
gcloud run services update librechat \
    --project=librechat-479911 \
    --region=us-central1 \
    --update-secrets="KEY1=name:latest,KEY2=name:latest"
```

(where `name` is the name of the secret in Google Secret Manager)

### How to test image locally

Create build with `docker build -t librechat-test .`

Then run with `docker run -p 3080:3080 --env-file .env librechat-test`

In .env file, `MONGO_URI` should point to prod database, `HOST` needs to be 0.0.0.0, and all required env vars (JWT, CRED) need to be set.

## Tips for development

Don't use devcontainer.

1. `nvm use` to ensure correct node version
2. `npm ci` for clean install
3. `npm run frontend` to build
4. Atartup a mongodb container in Docker
   - For example: `docker run -d --name chat-mongodb -p 27017:27017 mongo`
5. `npm run backend:dev` (serves built frontend on 3080)
6. `npm run frontend:dev` (serves dev frontend on 3090)

Whenever making changes to types etc (local packages `data-schemas` or `data-provider`); update the package build with `npm run build:packages`

- In `.env`, make sure all endpoints you want to support are marked as `user_provided` (this allows the user to set API keys, otherwise keys have to be provided in config files)
- For openrouter, the supported models have to be configured in `librechat.yaml`
