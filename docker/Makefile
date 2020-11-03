.PHONY: clean build push start connect stop rm

help: ## display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

default: all ## default target is all.

all: clean install build ## make clean install build.

clean: ## clean.

build: ## build the image.
	@exec docker build \
		-t jupyterlabbenchmarks/jlab-base:latest \
		-f Dockerfile.base \
		.
	@exec docker build \
		-t jupyterlabbenchmarks/jlab-virtual-notebook:latest \
		-f Dockerfile.virtual-notebook \
		.
	@exec docker build \
		-t jupyterlabbenchmarks/jlab-virtual-notebook-window:latest \
		-f Dockerfile.virtual-notebook-window \
		.

push: ## push the image.
	@exec docker push \
	    jupyterlabbenchmarks/jlab-base:latest
	@exec docker push \
	    jupyterlabbenchmarks/jlab-virtual-notebook:latest
	@exec docker push \
	    jupyterlabbenchmarks/jlab-virtual-notebook-window:latest

start-virtual-notebook: rm ## start the container.
	@exec docker run -it \
		-e JUPYTER_ENABLE_LAB=true \
		--rm \
		-d \
		--name jlab \
		-p 8888:8888 \
		jupyterlabbenchmarks/jlab-virtual-notebook:latest
	@exec sleep 1s
	make token
	make logs

start-virtual-notebook-window: rm ## start the container.
	@exec docker run -it \
		-e JUPYTER_ENABLE_LAB=true \
		--rm \
		-d \
		--name jlab \
		-p 8888:8888 \
		jupyterlabbenchmarks/jlab-virtual-notebook-window:latest
	@exec sleep 1s
	make token
	make logs

connect: ## connect to the container.
	@exec docker exec -it jlab bash

token: ## get the notebook token(s).
	@exec docker exec -it jlab jupyter notebook list

logs: ## show container logs
	docker logs jlab -f

attach:
	docker exec -it jlab bash

stop: ## stop the container.
	@exec docker stop jlab

rm: ## remove the container.
	docker rm -f jlab || true
 