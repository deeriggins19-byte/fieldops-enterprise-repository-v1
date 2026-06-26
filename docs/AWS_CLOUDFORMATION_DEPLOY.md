# AWS CloudFormation Deploy

This guide ties together the bootstrap stack and the ECS service stack.

## 1. Deploy the bootstrap stack

This stack creates the OIDC provider, IAM roles, ECR repositories, ECS cluster, log groups, and Secrets Manager placeholders.

```bash
aws cloudformation deploy \
  --stack-name fieldops-bootstrap \
  --template-file infra/aws/cloudformation/bootstrap.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    GitHubOwner=deeriggins19-byte \
    GitHubRepo=fieldops-enterprise-repository-v1 \
    EcrApiRepositoryName=fieldops-api \
    EcrWebRepositoryName=fieldops-web \
    EcsClusterName=fieldops-prod \
    EcsApiServiceName=fieldops-api-service \
    EcsWebServiceName=fieldops-web-service \
    DatabaseUrlSecretName=fieldops/prod/database-url \
    RedisUrlSecretName=fieldops/prod/redis-url \
    JwtSecretSecretName=fieldops/prod/jwt-secret \
    WebPublicApiUrl=https://<api-domain>
```

## 2. Deploy the ECS service stack

After bootstrap completes, deploy the ECS service stack with your actual VPC and subnet IDs.

```bash
aws cloudformation deploy \
  --stack-name fieldops-services \
  --template-file infra/aws/cloudformation/ecs-service.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ClusterName=fieldops-prod \
    ApiRepositoryUri=<account-id>.dkr.ecr.<region>.amazonaws.com/fieldops-api:latest \
    WebRepositoryUri=<account-id>.dkr.ecr.<region>.amazonaws.com/fieldops-web:latest \
    VpcId=vpc-xxxxxxxx \
    PublicSubnetIds='subnet-aaaaaaa,subnet-bbbbbbb' \
    ApiSecretsDatabaseUrlArn=<database-secret-arn> \
    ApiSecretsRedisUrlArn=<redis-secret-arn> \
    ApiSecretsJwtSecretArn=<jwt-secret-arn> \
    WebPublicApiUrl=https://<api-domain>
```

## 3. Update GitHub secrets

Make sure these repository secrets match the deployed infrastructure:

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

## 4. Verify

After both stacks deploy successfully, trigger the `Deploy AWS` workflow manually or push to `main`.
