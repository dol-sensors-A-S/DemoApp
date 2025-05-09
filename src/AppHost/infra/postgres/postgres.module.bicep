targetScope = 'resourceGroup'

@description('')
param location string = resourceGroup().location

@description('')
param administratorLogin string

@secure()
@description('')
param administratorLoginPassword string

@description('')
param keyVaultName string


resource keyVault_IeF8jZvXV 'Microsoft.KeyVault/vaults@2022-07-01' existing = {
  name: keyVaultName
}

resource postgreSqlFlexibleServer_hFZg1J8nf 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: toLower(take('postgres${uniqueString(resourceGroup().id)}', 24))
  location: location
  tags: {
    'aspire-resource-name': 'postgres'
  }
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    availabilityZone: '1'
  }
}

resource postgreSqlFirewallRule_t5EgXW1q4 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgreSqlFlexibleServer_hFZg1J8nf
  name: 'AllowAllAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource postgreSqlFlexibleServerDatabase_20T8zfO0Y 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgreSqlFlexibleServer_hFZg1J8nf
  name: 'demoApp'
  properties: {
  }
}

resource keyVaultSecret_Ddsc3HjrA 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  parent: keyVault_IeF8jZvXV
  name: 'connectionString'
  location: location
  properties: {
    value: 'Host=${postgreSqlFlexibleServer_hFZg1J8nf.properties.fullyQualifiedDomainName};Username=${administratorLogin};Password=${administratorLoginPassword}'
  }
}
