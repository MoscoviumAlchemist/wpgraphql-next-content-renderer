# Backend 4 Examples

This package houses the WordPress installation for the repository examples.

## Prerequisties

- [Node.js](https://nodejs.org/) installed
- [PHP Composer](https://getcomposer.org/) installed.
- [Docker](https://www.docker.com/) installed.

## Usage

1. Run `npm install` to install all dependencies.
2. Run `npm run dev:wp-frontend` start up the docker network.
3. Navigate to `http://localhost:8080/wp/wp-admin`. Username: `admin`. Password: `password`.

### Save DB changes

Run `npm run save-wp-db` from the repository run root and a new `.sql` file will be generated at `./packages/backend-4-examples/import/<file>.sql`

### Import DB files

WordPress DB backups can be placed in `./packages/backend-4-examples/import/` and docker with import the first SQL file in find alphabetically.
