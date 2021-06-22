#!/usr/bin/env node
/* eslint-env es2020 */

'use strict';
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const sri = require('sri-toolbox');
const https = require('https');

const instance = axios.create({
    timeout: 60000, // optional
    httpsAgent: new https.Agent({ keepAlive: true }),
    headers: { 'Content-Type': 'application/json' }
});
const configFile = path.resolve(__dirname, '../config/_files.yml');
const files = yaml.load(
    fs.readFileSync(path.join(__dirname, '../config/_files.yml')),
    'utf8'
);

function generateSri(file) {
    return new Promise((resolve, reject) => {
        setTimeout(async() => {
            try {
                console.log(`Generating sri for ${file}`);
                const res = await instance.get(file);
                const sriHash = sri.generate({ algorithms: ['sha384'] }, res.data);

                resolve(sriHash);
            } catch (error) {
                reject(error);
            }
        }, 1000);
    });
}

// Bootswatch
async function bootswatchSri(bs4 = false) {
    const baseLink = bs4 ? files.bootswatch4.bootstrap : files.bootswatch3.bootstrap;
    const themesArr = bs4 ? files.bootswatch4.themes : files.bootswatch3.themes;
    const sris = themesArr.map(async(theme) => {
        let axiosLink = bs4 ? baseLink.replace('SWATCH_VERSION', files.bootswatch4.version) : baseLink.replace('SWATCH_VERSION', files.bootswatch3.version);
        axiosLink = axiosLink.replace('SWATCH_NAME', theme.name);
        const themeSri = await generateSri(axiosLink);
        theme.sri = themeSri;

        return theme;
    });
    return sris;
}

// Bootstrap
async function bootstrapSri() {
    const sris = files.bootstrap.map(async(bootstrap) => {
        const { javascript, stylesheet } = bootstrap;
        const { javascriptBundle, javascriptEsm } = bootstrap;

        if (javascript) {
            const jsSri = await generateSri(javascript);
            bootstrap.javascriptSri = jsSri;
        }

        if (javascriptBundle) {
            const bundleSri = await generateSri(javascriptBundle);
            bootstrap.javascriptBundleSri = bundleSri;
        }

        if (javascriptEsm) {
            const esmSri = await generateSri(javascriptEsm);
            bootstrap.javascriptEsmSri = esmSri;
        }

        if (stylesheet) {
            const cssSri = await generateSri(stylesheet);
            bootstrap.stylesheetSri = cssSri;
        }

        return bootstrap;
    });
    return sris;
}

// Font Awesome
async function fontAwesomeSri() {
    const sris = files['@fortawesome/fontawesome-free'].map(
        async(fontawesome) => {
            const { stylesheet } = fontawesome;
            if (stylesheet) {
                const sri = await generateSri(stylesheet);
                fontawesome.stylesheetSri = sri;
                return fontawesome;
            }
        }
    );

    return sris;
}

// Bootlint
async function bootlintSri() {
    const sris = files.bootlint.map(async(bootlint) => {
        const { javascript } = bootlint;
        if (javascript) {
            const jsSri = await generateSri(javascript);
            bootlint.javascriptSri = jsSri;
            return bootlint;
        }
    });
    return sris;
}

// Bootstrap Icons
async function bootstrapIconsSri() {
    const sris = files['bootstrap-icons'].map(
        async(bootstrapIcons) => {
            const { stylesheet } = bootstrapIcons;
            if (stylesheet) {
                const sri = await generateSri(stylesheet);
                bootstrapIcons.stylesheetSri = sri;
                return bootstrapIcons;
            }
        }
    );

    return sris;
}

async function main() {
    const faPromises = await fontAwesomeSri();
    const faSri = await Promise.all(faPromises);

    const bootlintPromises = await bootlintSri();
    const blSri = await Promise.all(bootlintPromises);

    const bsPromises = await bootstrapSri();
    const bsSri = await Promise.all(bsPromises);

    const bs3Promises = await bootswatchSri();
    const b3Sri = await Promise.all(bs3Promises);

    const bs4Promises = await bootswatchSri(true);
    const b4Sri = await Promise.all(bs4Promises);

    const biPromises = await bootstrapIconsSri();
    const biSri = await Promise.all(biPromises);

    files['@fortawesome/fontawesome-free'] = faSri;
    files.bootlint = blSri;
    files.bootstrap = bsSri;
    files.bootswatch3.themes = b3Sri;
    files.bootswatch4.themes = b4Sri;
    files['bootstrap-icons'] = biSri;


    console.log('Writing to yml file...');
    fs.writeFileSync(
        configFile,
        yaml.dump(files, {
            lineWidth: -1
        })
    );
    fs.copyFileSync(configFile, `${configFile}.bak`);

    console.log(`Integrity generated for: ${configFile}`);
    console.log('Done');
}

main();
