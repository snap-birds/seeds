variable "input" {
  type = string
  default = "foobar"
}

resource "terraform_data" "main" {
  input = var.input
}

output "id" {
  value = terraform_data.main.id
}
