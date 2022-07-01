locals {
  envs_config = {
    prod-v1 = {
      account_id    = "986476384696" # prod-commitment-mapper-v1
      sls_role_name = "CommitmentMapperCommon-prod-v1"
    }
  }

  env = local.envs_config[terraform.workspace]
}
