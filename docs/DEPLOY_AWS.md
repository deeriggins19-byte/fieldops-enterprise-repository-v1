# AWS Deploy Guide

This repository uses an ECS Fargate deployment workflow in [.github/workflows/deploy-aws.yml](../.github/workflows/deploy-aws.yml).
See [docs/AWS_IAM_ROLE_AND_SECRETS.md](AWS_IAM_ROLE_AND_SECRETS.md) for the exact IAM role, policy, and secret setup.

## Required GitHub secrets

Set these in the repository settings before enabling deployment:

- `AWS_REGION`
- `AWS_ROLE_TO_ASSUME`
- `AWS_ACCOUNT_ID`
- `AWS_ECR_API_REPOSITORY`
- `AWS_ECR_WEB_REPOSITORY`
- `AWS_ECS_CLUSTER`
- `AWS_ECS_API_SERVICE`
- `AWS_ECS_WEB_SERVICE`
- `AWS_ECS_EXECUTION_ROLE`
- `AWS_ECS_TASK_ROLE`
- `AWS_SECRETS_MANAGER_DATABASE_URL_ARN`
- `AWS_SECRETS_MANAGER_REDIS_URL_ARN`
- `AWS_SECRETS_MANAGER_JWT_SECRET_ARN`
- `WEB_PUBLIC_API_URL`

## Required AWS resources

- 2 ECR repositories for API and web images.
- 1 ECS cluster with 2 Fargate services: API and web.
- 2 task definitions based on the templates in `infra/aws/ecs/`.
- 1 IAM OIDC role that GitHub Actions can assume.
- CloudWatch log groups for `/fieldops/api` and `/fieldops/web`.
- Secrets Manager entries for database, Redis, and JWT secret.

## Notes

- The workflow runs on `main` and can also be triggered manually.
- Update the task definition templates if your port mappings or CPU/memory differ from the defaults.
- Keep production secrets in AWS Secrets Manager, not in the repository.
