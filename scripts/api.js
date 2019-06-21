#!/usr/bin/env node

'use strict';

const fs         = require('fs');
const path       = require('path');
const yaml       = require('js-yaml');
const helpers    = require('../lib/helpers');

const configFile = path.join('config', '_api.yml');

const semver = require('semver');

function getDirectoryNames(source, ignore = []) {
    return fs.readdirSync(source)
      .map((name) => ignore.indexOf(name) === -1 && name)
      .filter((name) => {
          if (!name) {
              return false;
          }
          const absolute = path.join(source, name);
          const stat = fs.lstatSync(absolute);

          // @todo Remove symlink check when twitter-bootstrap files are moved
          // to the proper directory.
          return name && (stat.isDirectory() || stat.isSymbolicLink());
      });
}

function listFiles(dir) {
    return fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();

        return isDirectory ? [...files, ...listFiles(name)] : [...files, name];
    }, []);
}

const assetRegExp = /\.(css|js)$/;
const cdnPath = path.resolve(__dirname, '../cdn');
const validSemVer = /^\d+\.\d+\.\d+/;

function generateApiV1(packages) {
    const endpoint = {};

    console.log('Generating API (v1) endpoints:');

    packages.forEach((name) => {
        console.log(`/api/v1/${name}`);
        const packagePath = path.join(cdnPath, name);
        const versions = semver.rsort(
            getDirectoryNames(packagePath).filter((v) => validSemVer.test(v))
        );

        endpoint[name] = {};
        versions.forEach((version) => {
            console.log(`/api/v1/${name}/${version}`);

            const assets = {
                files: []
            };
            const versionPath = path.join(packagePath, version);
            const files = listFiles(versionPath);

            files.forEach((file) => {
                // Skip files that aren't considered assets.
                if (!assetRegExp.test(file)) {
                    return;
                }
                const stat = fs.lstatSync(file);
                const relative = path.relative(versionPath, file);
                const [, algorithm, hash] = helpers.generateSri(file).split(/(sha\d{3})-(.*)/) || [];
                const asset = {
                    name: `/${relative}`,
                    [algorithm]: hash,
                    size: stat.size
                    // @todo The modification time depends entirely on the one
                    // who is running the script and when they first downloaded
                    // the files (or updated them). This means this value can
                    // inconsistently change between developers and affect the
                    // API. For now, do not provide it until a more stable
                    // solution can be found.
                    // time: stat.mtime.toISOString()
                };

                if (algorithm && hash) {
                    asset[algorithm] = hash;
                }

                assets.files.push(asset);
            });

            endpoint[name][version] = assets;
        });
    });

    return endpoint;
}


// Backup the existing file.
fs.createReadStream(configFile)
  .pipe(fs.createWriteStream(`${configFile}.bak`));

// @todo Remove twitter-bootstrap once files are moved to the proper directory.
const packages = getDirectoryNames(cdnPath, ['css', 'js', 'twitter-bootstrap']);
const endpoints = {};

endpoints.v1 = generateApiV1(packages);

const generated = yaml.dump(endpoints, { lineWidth: -1 });

const header = `# THIS FILE IS GENERATED AUTOMATICALLY. DO NOT MODIFY THIS FILE DIRECTLY.
# Last generated: ${(new Date()).toString()}`;

fs.writeFileSync(configFile, `${header}\n${generated}`);
