locals {
  envs_config = {
    staging = {
      account_id                 = "091325440235"   # staging-commitment-store
      commitment_mapper_accounts = ["934818791296"] # staging-common
    }
    prod = {
      account_id                 = "734017092764"     # prod-commitment-store
      commitment_mapper_accounts = ["198096410949", "986476384696"] # prod-commitment-mapper-v0, prod-commitment-mapper-v1
    }
  }

  env = local.envs_config[terraform.workspace]
}
