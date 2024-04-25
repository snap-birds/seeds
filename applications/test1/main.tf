variable "input" {
  type = string
  default = "foobaz"
}

resource "terraform_data" "main" {
  input = var.inputs
}

output "id" {
  value = terraform_data.main.id
}
