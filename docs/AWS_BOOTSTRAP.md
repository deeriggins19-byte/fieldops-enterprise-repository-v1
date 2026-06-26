# AWS Bootstrap Commands

Use these commands to provision the minimum AWS resources for the ECS deploy workflow.

Replace the placeholders before running.

## Environment variables

```bash
export AWS_REGION=<aws-region>
export AWS_ACCOUNT_ID=<aws-account-id>
export REPO_OWNER=deeriggins19-byte
export REPO_NAME=fieldops-enterprise-repository-v1
export ROLE_NAME=GitHubActionsFieldOpsDeploy
export ECR_API_REPOSITORY=fieldops-api
export ECR_WEB_REPOSITORY=fieldops-web
export ECS_CLUSTER=fieldops-prod
export ECS_API_SERVICE=fieldops-api-service
export ECS_WEB_SERVICE=fieldops-web-service
export ECS_EXECUTION_ROLE=ecsTaskExecutionRole
export ECS_TASK_ROLE=ecsTaskRole
```

## 1. Create an OIDC provider for GitHub Actions

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## 2. Create the deploy role

Save this trust policy as `github-oidc-trust.json` and replace `ACCOUNT_ID`, `OWNER`, and `REPO`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Then create the role:

```bash
aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document file://github-oidc-trust.json
```

## 3. Attach permissions

Save the permissions policy as `github-deploy-policy.json` using the template in [docs/AWS_IAM_ROLE_AND_SECRETS.md](AWS_IAM_ROLE_AND_SECRETS.md).

```bash
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name GitHubActionsFieldOpsDeployPolicy \
  --policy-document file://github-deploy-policy.json
```

## 4. Create ECR repositories

```bash
aws ecr create-repository --repository-name "$ECR_API_REPOSITORY"
aws ecr create-repository --repository-name "$ECR_WEB_REPOSITORY"
```

## 5. Create Secrets Manager values

Use plain text secrets for the deploy workflow ARNs.

```bash
printf '%s' '<database-url>' | aws secretsmanager create-secret --name fieldops/prod/database-url --secret-string file:///dev/stdin
printf '%s' '<redis-url>' | aws secretsmanager create-secret --name fieldops/prod/redis-url --secret-string file:///dev/stdin
printf '%s' '<jwt-secret>' | aws secretsmanager create-secret --name fieldops/prod/jwt-secret --secret-string file:///dev/stdin
```

Capture the ARNs and store them in GitHub as repository secrets:

- `AWS_SECRETS_MANAGER_DATABASE_URL_ARN`
- `AWS_SECRETS_MANAGER_REDIS_URL_ARN`
- `AWS_SECRETS_MANAGER_JWT_SECRET_ARN`

## 6. Create ECS cluster and services

The workflow expects an ECS cluster and two services already created.

Recommended names:

- Cluster: `$ECS_CLUSTER`
- API service: `$ECS_API_SERVICE`
- Web service: `$ECS_WEB_SERVICE`

Create the cluster before registering the task definitions.

```bash
aws ecs create-cluster --cluster-name "$ECS_CLUSTER"
```

## 7. Add GitHub repository secrets

Set these in the repository settings:

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

## 8. Final check

Run the workflow manually from GitHub Actions once the secrets and resources exist.
