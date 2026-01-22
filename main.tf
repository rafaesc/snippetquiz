terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "958b0499-3e8e-4dc8-a2ab-6d06224a39ff"
}

data "azurerm_kubernetes_service_versions" "current" {
  location = "WestUS2"
}

resource "azurerm_resource_group" "main" {
  name     = "rg-snippetquiz-aks"
  location = "WestUS2"
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = "snippetquiz-cluster"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "snippetquiz-aks"
  kubernetes_version  = data.azurerm_kubernetes_service_versions.current.latest_version

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_D2pls_v5"
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin     = "azure"
    network_policy     = "cilium"
    network_data_plane = "cilium"
  }
}
