# Bootstrap CDN

[![Follow BootstrapCDN on Twitter](https://img.shields.io/badge/twitter-@getBootstrapCDN-55acee.svg?style=flat-square)](https://twitter.com/getbootstrapcdn)
[![Linux Build Status](https://img.shields.io/travis/MaxCDN/bootstrap-cdn/develop.svg?label=Linux%20build&style=flat-square)](https://travis-ci.org/MaxCDN/bootstrap-cdn)
[![Windows Build status](https://img.shields.io/appveyor/ci/jdorfman/bootstrap-cdn/develop.svg?label=Windows%20build&style=flat-square)](https://ci.appveyor.com/project/jdorfman/bootstrap-cdn)
[![dependencies Status](https://img.shields.io/david/MaxCDN/bootstrap-cdn.svg?style=flat-square)](https://david-dm.org/MaxCDN/bootstrap-cdn)
[![devDependencies Status](https://img.shields.io/david/dev/MaxCDN/bootstrap-cdn.svg?style=flat-square)](https://david-dm.org/MaxCDN/bootstrap-cdn?type=dev)

## Deploy your own copy on Heroku

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Requirements

1. [Node.js](https://nodejs.org/)

## Running

Use `node make <task>`.

### Development

```sh
npm install

node make test run
```

### Demonized

```shell
# start server
node make start

# stop server
node make stop

# restart server
node make restart

# server status
node make status

# view logs
node ./node_modules/.bin/forever logs app.js
```

## Configuration

### `config/_config.yml`

Key Overview:

1. `port`: Integer value of the Node application port.
2. `theme`: Integer value of the array index from the `bootswatch` section below.
3. `authors`: Array of author Strings
4. `description`: String containing the default meta description of the site.
5. `javascripts`: Array containing JavaScript files to be loaded.
6. `bootswatch`: Hash containing current Bootswatch meta data and themes.
7. `bootlint`: Array of hashes containing Bootlint meta data and paths.
8. `bootstrap`: Array of hashes containing Bootstrap meta data and paths.
