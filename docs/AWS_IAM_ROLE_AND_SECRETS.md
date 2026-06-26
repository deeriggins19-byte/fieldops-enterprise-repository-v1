# AWS IAM Role and Secrets

Use this guide to finish the AWS deploy setup for [.github/workflows/deploy-aws.yml](../.github/workflows/deploy-aws.yml).

## 1. GitHub OIDC trust policy

Create an IAM role for GitHub Actions with this trust policy. Replace `ACCOUNT_ID`, `OWNER`, and `REPO`.

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

## 2. Permissions policy

Attach a permissions policy like this to the deploy role. Replace the placeholders with your account, region, and resource names.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EcrAuth",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "EcrPushPull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
        "ecr:BatchGetImage",
        "ecr:DescribeRepositories",
        "ecr:DescribeImages",
        "ecr:ListImages"
      ],
      "Resource": [
        "arn:aws:ecr:AWS_REGION:ACCOUNT_ID:repository/AWS_ECR_API_REPOSITORY",
        "arn:aws:ecr:AWS_REGION:ACCOUNT_ID:repository/AWS_ECR_WEB_REPOSITORY"
      ]
    },
    {
      "Sid": "EcsDeploy",
      "Effect": "Allow",
      "Action": [
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:ListTasks"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassRoles",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": [
        "arn:aws:iam::ACCOUNT_ID:role/AWS_ECS_EXECUTION_ROLE",
        "arn:aws:iam::ACCOUNT_ID:role/AWS_ECS_TASK_ROLE"
      ]
    },
    {
      "Sid": "ReadSecrets",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
      "Resource": [
        "AWS_SECRETS_MANAGER_DATABASE_URL_ARN",
        "AWS_SECRETS_MANAGER_REDIS_URL_ARN",
        "AWS_SECRETS_MANAGER_JWT_SECRET_ARN"
      ]
    },
    {
      "Sid": "Logs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

## 3. GitHub repository secrets

Add these repository secrets in GitHub:

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

## 4. AWS secrets to create

Store the production values in AWS Secrets Manager. Use separate secret values or a JSON secret per variable; the workflow expects ARN references.

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`

Suggested secret names:

- `fieldops/prod/database-url`
- `fieldops/prod/redis-url`
- `fieldops/prod/jwt-secret`

## 5. Notes

- The deploy workflow publishes API and web images to ECR using the commit SHA as the tag.
- ECS services are updated with new task definitions on every push to `main`.
- Keep the deploy role limited to the specific repositories, services, and secrets above.
