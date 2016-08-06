# Bootstrap CDN

[![Join the chat at https://gitter.im/MaxCDN/bootstrap-cdn](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MaxCDN/bootstrap-cdn)
[![Build Status](https://travis-ci.org/MaxCDN/bootstrap-cdn.svg?branch=master)](https://travis-ci.org/MaxCDN/bootstrap-cdn)
[![dependencies Status](https://david-dm.org/MaxCDN/bootstrap-cdn/status.svg)](https://david-dm.org/MaxCDN/bootstrap-cdn)
[![devDependencies Status](https://david-dm.org/MaxCDN/bootstrap-cdn/dev-status.svg)](https://david-dm.org/MaxCDN/bootstrap-cdn?type=dev)


## Deploy your own copy on Heroku

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)


## Requirements

1. [Node.js](https://nodejs.org/)

## Running

When running basic `make` tasks, `make <task>` is supported for \*nix users and `node make <task>` is supported for Windows users.

### Development

```sh
npm install

[node] make test run
```


### Demonized

```
##
# for the following make tasks, you can also run:
#
# npm <task name>
##

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
3. `authors`: Array of Author Strings
4. `description`: String containing the meta description of the site.
5. `google_analytics`: Hash containing GA `account_id` and `domain_name`.
6. `stylesheets`: Array containing stylesheet files to be loaded at the top of the site.
7. `javascripts`: Array containing javascript files to be loaded either `before` (at the top) or `after` (at the bottom) of the site.
8. `bootswatch`: Hash containing current Bootswatch meta data and themes.
9. `bootlint`: Array of Hashes containing Bootlint meta data and pathing.
10. `bootstrap`: Array of Hashes containing Bootstrap meta data and pathing.

### `config/_tweets.yml`

To add new tweets to the "Mad Love" section, follow these steps:

1. Copy the full `<blockquote>` HTML from the "Embed Tweet" source obtained via Twitter.
2. Replace all double quotes (`"`) with single quotes (`'`).
3. Wrap entire HTML block in double quotes (`"`).
4. Add to `_tweets.yml`, preceeded with a dash (`-`), which signifies an array item in YAML.

### `config/_oauth.yml`

This is reserved for MaxCDN and NetDNA installation only at this time. Contact @jdorfman for more information.
