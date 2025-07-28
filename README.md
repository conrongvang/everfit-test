## Estimate

11 hours

## Installation

```bash
$ npm install
```

## Init .env file

```sh
$ touch .env
```

Copy and paste the following

```env
# local ports
DB_HOST=localhost
DB_TYPE=postgres
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=tracking_metrics
BE_HOST_PORT=5001

```

## Running the app

```bash

## ================================================
## docker
## ================================================
$ docker-compose up -d

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## formatter,linter,typecheck

```sh
## formatter
$ npm run format

## linter
$ npm run lint

## typecheck
$ npm run typecheck
```

## Init testing database

```bash
# init database
docker-compose -f docker-compose-testing.yml --env-file .env.test up -d
```

## Stay in touch

- Author - [Nguyen Long]
- Phone - 84 354 310 633
