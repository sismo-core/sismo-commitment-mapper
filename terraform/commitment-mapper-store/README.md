# Commitment Mapper Terraform

This stack creates a DynamoDB table which is called the commitment store. It
also creates a role assumable by Commitment Mapper accounts.

## Environments

There are two environments:

- staging
- prod

Each env is a terraform workspace:

```hcl
terraform workspace select staging
terraform workspace select prod
```

Environment configurations are in [env.tf](./env.tf) file.

## Accounts

- staging

commitment-store: `091325440235` (`staging-commitment-store`)
commitment-mapper: `934818791296` (`staging-common`)

- prod

commitment-store: `734017092764` (`prod-commitment-store`)  
commitment-mapper-v1: `986476384696` (`prod-commitment-mapper-v1`)
