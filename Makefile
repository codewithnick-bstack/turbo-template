.PHONY: setup dev dev-api dev-web dev-admin db db-down migrate seed reset logs typecheck lint help

# ── First-time setup ──────────────────────────────────────────────────────────
setup: ## Install deps, copy env files, start infra, run migrations
	pnpm install
	@for f in apps/api/.env apps/web/.env.local apps/admin/.env.local; do \
	  example="$$f.example"; [ -f "$$f" ] || [ ! -f "$$example" ] || (echo "Creating $$f" && cp "$$example" "$$f"); \
	done
	$(MAKE) db
	sleep 2
	$(MAKE) migrate
	@echo ""
	@echo "Setup complete. Run 'make dev' to start."

# ── Dev servers ───────────────────────────────────────────────────────────────
dev: ## Start all apps (api :3001, web :3000, admin :4000)
	pnpm turbo run dev --filter=api --filter=web --filter=admin

dev-api: ## Start only api (:3001)
	pnpm --filter api dev

dev-web: ## Start only web (:3000)
	pnpm --filter web dev

dev-admin: ## Start only admin (:4000)
	pnpm --filter admin dev

# ── Quality ───────────────────────────────────────────────────────────────────
typecheck: ## Type-check all apps and packages
	pnpm turbo run typecheck

lint: ## Lint all apps and packages
	pnpm turbo run lint

# ── Database / infra ──────────────────────────────────────────────────────────
db: ## Start Postgres (docker compose)
	docker compose -f infra/docker-compose.yml up -d postgres

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
