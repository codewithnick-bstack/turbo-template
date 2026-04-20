.PHONY: setup dev db db-down migrate seed reset logs help

# ── First-time setup ──────────────────────────────────────────────────────────
setup: ## Install deps, copy env files, start infra, run migrations
	pnpm install
	@for f in .env apps/platform-api/.env apps/admin/.env apps/mcp/.env apps/worker/.env; do \
	  [ -f "$$f" ] || (echo "Creating $$f" && cp "$$f.example" "$$f"); \
	done
	$(MAKE) db
	sleep 2
	$(MAKE) migrate
	@echo ""
	@echo "✓ Setup complete. Run 'make dev' to start."

# ── Dev servers ───────────────────────────────────────────────────────────────
dev: ## Start all apps in parallel (admin :4000, platform-api :4100, mcp :4200)
	pnpm dev

dev-api: ## Start only platform-api
	pnpm --filter platform-api dev

dev-admin: ## Start only admin
	pnpm --filter admin dev

# ── Database / infra ──────────────────────────────────────────────────────────
db: ## Start Postgres, Redis, MinIO (docker compose)
	docker compose -f infra/docker-compose.yml up -d postgres redis minio

db-down: ## Stop all infra containers
	docker compose -f infra/docker-compose.yml down

migrate: ## Run database migrations
	pnpm db:migrate

seed: ## Seed the database with dev fixtures
	pnpm db:seed

reset: ## Drop and recreate the database, run migrations + seed
	docker compose -f infra/docker-compose.yml down -v
	$(MAKE) db
	sleep 2
	$(MAKE) migrate
	$(MAKE) seed

logs: ## Tail docker compose logs
	docker compose -f infra/docker-compose.yml logs -f

# ── Help ──────────────────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
