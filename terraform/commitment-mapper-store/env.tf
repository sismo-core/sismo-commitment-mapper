locals {
  envs_config = {
    staging = {
      account_id                 = "091325440235"   # staging-commitment-store
      commitment_mapper_accounts = ["934818791296"] # staging-common
    }
    prod = {
      account_id                 = "734017092764"                   # prod-commitment-store
      commitment_mapper_accounts = ["198096410949", "986476384696"] # prod-commitment-mapper-v0, prod-commitment-mapper-v1
    }
    # Commitment mapper v2 in the isolated environnement
    prod-v2 = {
      account_id                 = "177152102646"   # prod-commitment-mapper-v2
      commitment_mapper_accounts = ["177152102646"] # prod-commitment-mapper-v2
    }
    # Deploy only in prod-common !
    prod-beta = {
      account_id                 = "214635901820"   # prod-common
      commitment_mapper_accounts = ["214635901820"] # prod-common
    }
    staging-beta = {
      account_id                 = "934818791296"   # staging-common
      commitment_mapper_accounts = ["934818791296"] # staging-common
    }
    dev-beta = {
      account_id                 = "214635901820"   # prod-common
      commitment_mapper_accounts = ["214635901820"] # prod-common
    }
  }

  env = local.envs_config[terraform.workspace]
}
