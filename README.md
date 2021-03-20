# BootstrapCDN

[![jsDelivr Download Stats](https://data.jsdelivr.com/v1/package/npm/bootstrap/badge)](https://www.jsdelivr.com/package/npm/bootstrap)
[![Build Status](https://img.shields.io/github/workflow/status/jsdelivr/bootstrapcdn/Tests/develop?logo=github&label=Tests&style=flat-square)](https://github.com/jsdelivr/bootstrapcdn/actions?query=workflow%3ATests+branch%3Adevelop)
[![Coverage Status](https://img.shields.io/coveralls/github/jsdelivr/bootstrapcdn/develop?style=flat-square)](https://coveralls.io/github/jsdelivr/bootstrapcdn)
[![dependencies Status](https://img.shields.io/david/jsdelivr/bootstrapcdn.svg?style=flat-square)](https://david-dm.org/jsdelivr/bootstrapcdn)
[![devDependencies Status](https://img.shields.io/david/dev/jsdelivr/bootstrapcdn.svg?style=flat-square)](https://david-dm.org/jsdelivr/bootstrapcdn?type=dev)


[BootstrapCDN](https://www.bootstrapcdn.com/) is the easiest and fastest way to get started with Bootstrap, Font Awesome, Bootswatch and Bootstrap Icons.
Simply visit the main site and copy the URLs you need. New versions of all projects are pulled directly from NPM. 

Or follow the instructions bellow for more advanced use cases.

### Example CDN links

These will pull the `4.6.0` version. It is safe to use SRI with static versions like this.
```
<!-- CSS only -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- JavaScript Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"></script>
```

### Version aliasing

To auto-update to latest minor version you can specify for example `4` as the version in the URL. 
You will then get the latest v4 version available with a delay of up to 7 days.
```
<!-- CSS only -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@4/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- JavaScript Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4/dist/js/bootstrap.bundle.min.js"></script>
```
Warning: Do not use SRI hashes with dynamic URLs like this or the next update will break your site.

A more detailed documentation is available on [jsDelivr's Github page](https://github.com/jsdelivr/jsdelivr#usage).

### Using the API to pull versions

For certain use-cases it is possible to automate updates [using our API](https://data.jsdelivr.com/v1/package/npm/jquery). 
You can use it to get the list of versions available on the CDN including the latest one.
```
https://data.jsdelivr.com/v1/package/npm/bootstrap
{
	"tags": {
		"latest": "4.6.0",
		"previous": "3.4.1",
		"next": "5.0.0-beta2"
	},
	"versions": [
		"5.0.0-beta2",
...
		"4.6.0",
...
	]
}
```

## Contributing

### Requirements

1. [Node.js](https://nodejs.org/)

### Running

Use `npm run <task>`.

### Development

```sh
npm install

npm test && npm run dev
```

### Demonized

```shell
# start development server and watch for changes
npm run dev
# or
npm run watch

# start production server
npm start

# and more
npm run
```

### Configuration

#### `config/_app.yml`

The Express.js app configuration.

* port: Integer value of the Node application port.
* theme: Integer value of the default theme we use; it's the array index value from the `bootswatch4` section below.
* siteurl: Our canonical URL.
* authors: Array of author Objects. Accepts the following:
    * name
    * twitter: the Twitter handler without `@`
    * url: author's website URL (optional)
    * work: (optional) Object which can contain:
        * text: the text to show for the `url` bellow
        * url: the link to the work
* description: String containing the default meta description of the site.
* favicon: The path to `favicon.ico`.
* stylesheet: Array of stylesheet file(s) we use apart from the Bootswatch stylesheet.
* javascript: Array of javascript file(s) we use.
* redirects: Array of Objects for the page redirects.

#### `config/_extras.yml`

Contains the `/showcase/` and `/integrations/` config we use in the Express.js app.

#### `config/_files.yml`

Contains the CDN files we host.The SRI values are updated by running `npm run integrity`.

#### `config/helmet-csp.js`

Our CSP config using <https://github.com/helmetjs/csp>

### Updating Bootstrap/Bootlint/Bootswatch

Replace `package` by the package you want to update and `version` with its version in the following commands:

```shell
npm i package@version -ED
npm run package version
```

1. Update `config/_config.yml` accordingly
2. `npm run integrity`
3. Make sure `npm run all` passes after the files are on S3/CDN and verify the frontend works as expected without any visual breakage
