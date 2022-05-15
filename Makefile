.PHONY: build
build: ## Build the eco interpreter.
	@ cargo build --manifest-path=lang/Cargo.toml

.PHONY: install
install: ## Install eco onto your machine.
	@ printf "Have not finished program.\n";

.PHONY: test
test: ## Run all tests.
	@ cargo test --manifest-path=lang/Cargo.toml
	@ npm test --prefix ui

.PHONY: gentype
gentype: ## Generate TypeScript types from our Rust code
	@ cargo test --manifest-path=lang/Cargo.toml
	@ cp -r ./lang/bindings/* ./ui/src/lang-types

.PHONY: clean
clean: ## Clean up the project.
	@ cargo clean --manifest-path=lang/Cargo.toml

.PHONY: healthcheck
healthcheck: ## Make sure that this system can work with the project.
	@ ./scripts/healthcheck

.PHONY: setup
setup: ## Setup all necessary files for the project to work.
	@ mkdir -p ~/.eco
	@ cp -r ./strategies ~/.eco/strategies
	@ npm install --prefix ui

.PHONY: help
help: ## Print this help message and exit.
	@ printf "\033[1;34m%s\033[0m\n" "Makefile Help"
	@ grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
