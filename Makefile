.PHONY: build
build: ## Build the eco interpreter.
	@ cargo build --manifest-path=lang/Cargo.toml

.PHONY: install
install: ## Install eco onto your machine.
	@ printf "Have not finished program.\n";

.PHONY: test
test: ## Run all tests.
	@ cargo test --manifest-path=lang/Cargo.toml

.PHONY: clean
clean: ## Clean up the project.
	@ cargo clean --manifest-path=lang/Cargo.toml

.PHONY: healthcheck
healthcheck: ## Make sure that this system can work with the project.
	@ python scripts/healthcheck.py

.PHONY: setup
setup: ## Setup all necessary files for the project to work.
	@ python scripts/setup.py

.PHONY: help
help: ## Print this help message and exit.
	@ python scripts/help.py
