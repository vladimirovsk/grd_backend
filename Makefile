#!make
DOCKER_COMPOSE_FILE=-f ./docker/docker-compose.yml
PROJECT_NAME=GRD
ifeq ($(MODE), DEV)
	DOCKER_COMPOSE_FILE=-f ./docker/docker-compose.yml -f ./docker/docker-compose.dev.yml
endif

reload:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) down
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) up -d --build
.PHONY: restart

restart:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) stop
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) up -d --build
.PHNY:restart

down:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) down -v
.PHONY: down

stop:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) stop
.PHONY: stop

up: run
.PHONY: up

run:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) up -d --build
.PHONY: run

goToServer:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) exec server sh
.PHONY: goToServer

startServer:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) up -d --build server
.PHONY: startServer

log:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) logs --tail=200 server
.PHONY: log

logDB:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) logs --tail=all database
.PHONY: logDB

logExpress:
	@docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) logs mongo-express
.PHONY: logExpress

ps:status
.PHONY:ps

status:
	docker-compose -p $(PROJECT_NAME) $(DOCKER_COMPOSE_FILE) ps
.PHONY: status

