### Deployment info (sofvanh)

#### Deployment stack

- MongoDB Atlas
- Google Cloud Run
  - With CLoud Build and Artifact Registry, and Secret Manager

#### How to update

1. Merge update to branch `prod`
2. Run `./deploy/deploy-to-cloudrun.sh

#### How to test image locally

See local (private) README

#### How to create a new account

1. Edit `.env` file so that `MONGO_URI` is the address to prod db (same as gcloud secret)
2. Run `npm run create-user`
