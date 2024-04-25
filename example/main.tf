variable "input" {
  type = string
  default = "foobaz"
}

resource "terraform_data" "main" {
  input = var.input
}

output "id" {
  value = terraform_data.main.id
}
