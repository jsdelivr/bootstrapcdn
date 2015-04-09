# Bootstrap CDN

[![Join the chat at https://gitter.im/MaxCDN/bootstrap-cdn](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MaxCDN/bootstrap-cdn?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/MaxCDN/bootstrap-cdn.png?branch=master)](https://travis-ci.org/MaxCDN/bootstrap-cdn)
[![Dependency Status](https://david-dm.org/MaxCDN/bootstrap-cdn.svg?style=flat)](https://david-dm.org/MaxCDN/bootstrap-cdn)
[![devDependency Status](https://david-dm.org/MaxCDN/bootstrap-cdn/dev-status.svg?style=flat)](https://david-dm.org/MaxCDN/bootstrap-cdn#info=devDependencies)

## Requirements

1. [Node.js](http://nodejs.org/)

## Running

When running basic `make` tasks, `make <task>` is supported for \*nix users and `node make <task>` is supported for Windows users.

### Development

```sh
npm install

[node] make test run
```

#### Stubbing "Popular Files"

There are two ways of using local `popular.json` data.

The first is to use the stubbed version in the test framework, this can be done by changing `config/_config.yml` and setting `extras` to `stub`...

```yaml
####
# Turn stats on or off.
# - Use 'stub' to develop against test stub.
# extras: true
extras: stub
```

The second method would be to copy `tests/stubs/popular.json` to your system's temp directory as `.popular.json` &ndash; e.g. `/tmp/.popular.json` on Linux and Mac.

If you're unsure of the location of the temp directory on your system, do the following:

```sh
$ node
> os.tmpdir()
'/tmp'
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
tail -f ./logs/server.log
```

### Nginx

Nginx tasks are only supported on \*nix platforms which support `make`.

```
# generate nginx conf for your checkout and start nginx
node make nginx/start

# stop nginx
node make nginx/stop

# restart (stop then start) nginx
node make nginx/restart

# HUP nginx process to reload configs
node make nginx/reload

# to regnerate nginx.conf
rm nginx.conf
```

## Configuration

### `config/_config.yml`

Key Overview:

1. `port`: Integer value of the Node application port.
2. `theme`: Integer value of the array index from the `bootswatch` section below.
3. `authors`: Array of Author Strings
4. `description`: String containing the meta descript of the site.
5. `extras`: Turn on extras functionality. Requires `config/_oauth.yml` update with correct `key` and `security` tokens.
5. `favicon`: Hash containing the favicon path.
6. `google_analytics`: Hash containing GA `account_id` and `domain_name`.
7. `stylesheets`: Array containing stylesheet files to be loaded at the top of the site.
8. `javascripts`: Array containing javascript files to be loaded either `before` (at the top) or `after` (at the bottom) of the site.
9. `bootswatch`: Hash containing current Bootswatch meta data and themes.
10. `bootlint`: Array of Hashes containing Bootlint meta data and pathing.
11. `bootstrap`: Array of Hashes containing Bootstrap meta data and pathing.

### `config/_tweets.yml`

To add new tweets to the "Mad Love" section, follow these steps:

1. Copy the full `<blockquote>` HTML from the "Embed Tweet" source obtained via Twitter.
2. Replace all double quotes (`"`) with single quotes (`'`).
3. Wrap entire HTML block in double quotes (`"`).
4. Add to `_tweets.yml`, preceeded with a dash (`-`), which signifies an array item in YAML.

### `config/_oauth.yml`

This is reserved for MaxCDN and NetDNA installation only at this time. Contact @jdorfman for more information.
 
