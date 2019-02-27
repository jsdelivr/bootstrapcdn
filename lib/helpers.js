'use strict';

const fs = require('fs');
const semver = require('semver');
const sri = require('sri-toolbox');

const { app, files } = require('../config');

function generateSri(file, fromString) {
    file = fromString ? file : fs.readFileSync(file);

    return sri.generate({
        algorithms: ['sha384']
    }, file);
}

function selectedTheme(selected) {
    if (typeof selected === 'undefined' || selected === '') {
        return app.theme;
    }

    const theme = parseInt(selected, 10);

    return theme === 0 || theme ?
        theme :
        app.theme;
}

function getTheme(selected) {
    const { themes } = files.bootswatch4;

    selected = selectedTheme(selected);

    return {
        uri: files.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', files.bootswatch4.version)
                .replace('SWATCH_NAME', themes[selected].name),
        sri: themes[selected].sri
    };
}

function generateDataJson() {
    const data = {
        // @todo Figure out if/when this will go away?
        deprecated: 'This file will no longer receive any updates. Visit https://www.bootstrapcdn.com/api for documentation.',
        timestamp: new Date().toISOString(),
        bootstrap: {},
        fontawesome: {}
    };

    files.bootstrap.forEach((bootstrap) => {
        const bootstrapVersion = bootstrap.version;

        if (semver.satisfies(semver.coerce(bootstrapVersion), '<4')) {
            data.bootstrap[bootstrapVersion] = {
                css: bootstrap.stylesheet,
                js: bootstrap.javascript
            };
        }
    });

    files.fontawesome.forEach((fontawesome) => {
        data.fontawesome[fontawesome.version] = fontawesome.stylesheet;
    });

    return data;
}

/**
 * Helper methods used to handle the API.
 */
const api = {

    badRequest(message = 'Bad Request.', suffix) {
        return this.message(message, suffix, 400);
    },

    data(name, version = null, endpoint = config.apiVersion) {
        const data = this.raw(name, endpoint);

        // Unknown data (without version).
        if (!data && !version) {
            return this.notFound(`Couldn't fetch versions for ${name}.`);
            // Unknown data (with version).
        } else if (!data) {
            return this.notFound(`Couldn't find ${name}/${version}.`);
        }

        // If a specific version wasn't specified, show all available versions.
        if (!version) {
            const tags = this.tags(name, endpoint);
            const versions = this.versions(name, endpoint);

            return {
                tags,
                versions
            };
        }

        // Version was specified, but doesn't exist.
        if (!data[version]) {
            return this.notFound(`Couldn't find version ${version} for ${name}. Make sure you use a specific version number, and not a version range or a tag.`);
        }

        // Valid version, return version specific assets.
        return data[version];
    },

    latest(name, endpoint = config.apiVersion) {
        return this.tag('latest', name, endpoint);
    },

    message(message, suffix = `Visit ${config.siteurl}/api for documentation.`, status = 200) {
        if (suffix) {
            message += ` ${suffix}`;
        }
        return {
            status,
            message
        };
    },

    notFound(message = 'Not found.', suffix) {
        return this.message(message, suffix, 404);
    },

    raw(name, endpoint = config.apiVersion) {
        return (config.api[endpoint] && config.api[endpoint][name]) || null;
    },

    send(res, data, statusCode = null) {
        if (!statusCode) {
            statusCode = data.status ? data.status : 200;
        }
        return res.status(statusCode).json(data);
    },

    tag(tag, name, endpoint = config.apiVersion) {
        const tags = this.tags(name, endpoint);

        return tags[tag] || null;
    },

    tags(name, endpoint = config.apiVersion) {
        const tags = {};

        if (config.api[endpoint] && config.api[endpoint][name]) {
            const versions = this.versions(name, endpoint);
            const latest = versions[0];

            if (latest) {
                tags.latest = latest;
                const previous = versions.filter((v) => v[0] !== tags.latest[0])[0] || versions[1] || null;

                if (previous) {
                    tags.previous = previous;
                }
            }
        }
        return tags;
    },

    versions(name, endpoint = config.apiVersion) {
        return Object.keys(this.raw(name, endpoint) || {});
    }

};

module.exports = {
    api,
    generateDataJson,
    theme: {
        get: getTheme,
        selected: selectedTheme
    },
    generateSri
};

// vim: ft=javascript sw=4 sts=4 et:
