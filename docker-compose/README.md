`docker-compose` files for running TruBudget:

<!-- - [`local`](./local/): builds images from source
- [`main`](./main/): uses images from Docker Hub
- [`multi`](./multi/): builds images from source. Starts environment with multiple beta nodes -->

- [`testing`](./testing/): uses images from Docker Hub and runs end-to-end tests. The tests themselves are built from source.

## Persistence

volumes -> data stored on machine
default docker-compose -> data stored in container
--force-recreate flag -> data deleted

# Local vs Image

## Image

docker-compose.yml -> use specific tag available from dockerhub or as image tag on the machine

## Local

local-docker-compose -> build image from local source with dockerfile

### Hot-Reloading

hot-reloading.docker-compose.yml mounts src path into container so changes are recognized
