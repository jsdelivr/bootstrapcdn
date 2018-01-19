# BootstrapCDN

[![Follow BootstrapCDN on Twitter](https://img.shields.io/badge/twitter-@getBootstrapCDN-55acee.svg?style=flat-square)](https://twitter.com/getbootstrapcdn)
[![Linux Build Status](https://img.shields.io/travis/MaxCDN/bootstrapcdn/develop.svg?label=Linux%20build&style=flat-square)](https://travis-ci.org/MaxCDN/bootstrapcdn)
[![Windows Build status](https://img.shields.io/appveyor/ci/jdorfman/bootstrapcdn/develop.svg?label=Windows%20build&style=flat-square)](https://ci.appveyor.com/project/jdorfman/bootstrapcdn)
[![dependencies Status](https://img.shields.io/david/MaxCDN/bootstrapcdn.svg?style=flat-square)](https://david-dm.org/MaxCDN/bootstrapcdn)
[![devDependencies Status](https://img.shields.io/david/dev/MaxCDN/bootstrapcdn.svg?style=flat-square)](https://david-dm.org/MaxCDN/bootstrapcdn?type=dev)

## Deploy your own copy on Heroku

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Requirements

1. [Node.js](https://nodejs.org/)

## Running

Use `npm run <task>`.

### Development

```sh
npm install

npm test && npm run dev
```

### Demonized

```shell
# start production server
npm start

# stop server
npm stop

# restart server
npm restart

# and more
npm run
```

## Configuration

### `config/_config.yml`

Key Overview:

1. `port`: Integer value of the Node application port.
2. `theme`: Integer value of the array index from the `bootswatch` section below.
3. `authors`: Array of author Strings
4. `description`: String containing the default meta description of the site.
5. `javascript`: Array containing JavaScript files to be loaded.
6. `bootswatch3`: Hash containing current Bootswatch 3 meta data and themes.
7. `bootswatch4`: Hash containing current Bootswatch 4 meta data and themes.
8. `bootlint`: Array of hashes containing Bootlint meta data and paths.
9. `bootstrap`: Array of hashes containing Bootstrap meta data and paths.
