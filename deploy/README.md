### Deployment info (sofvanh)

#### Deployment stack

- MongoDB Atlas
- Google Cloud Run
  - With CLoud Build and Artifact Registry, and Secret Manager

#### How to update

1. Merge update to branch `prod`
2. Run `./deploy/deploy-to-cloudrun.sh

##### Updating env vars or secrets only

` gcloud run services update librechat \
    --region=us-central1 \
    --update-env-vars="KEY1=value,KEY2=value"`

` gcloud run services update librechat \
    --region=us-central1 \
    --update-secrets="KEY1=name:latest,KEY2=name:latest"`

(where `name` is the name of the secret in Google Secret Manager)

#### How to test image locally

See local (private) README

#### How to create a new account

1. Edit `.env` file so that `MONGO_URI` is the address to prod db (same as gcloud secret)
2. Run `npm run create-user`
