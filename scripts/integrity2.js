'use strict'

const axios = require('axios').default

const apiURL = 'https://data.jsdelivr.com/v1/package/npm'

async function getPackage(packageName) {
    const { data } = await axios.get(`${apiURL}/${packageName}`)
    return data
}

function findFile(folder, filename) {
    const file = folder.files.find((file) => file.name == filename)
    return file
}

function buildPath(packageData, ext, filename) {
    let path = `${packageData.version}/`
    const dir = findFile(packageData, 'dist')
    if (dir) {
        path += dir.name
        const extensionFolder = findFile(dir, ext)
        if (extensionFolder) {
            path += `/${extensionFolder.name}`
            const file = findFile(extensionFolder, filename)
            if (file) {
                path += `/${file.name}`
            }
        }
        return path
    }
}

async function onPackageVersions({ versions }) {
    try {
        const promises = versions.map(async (version) => {
            const res = await getPackage(`bootstrap@${version}`)
            return { ...res, version }
        })

        const packages = await Promise.all(promises)

        const cdn = packages.map((pack) => {
            const paths = {}
            paths.stylesheet = buildPath(pack, 'css', 'bootstrap.min.css')
            paths.javascript = buildPath(pack, 'js', 'bootstrap.min.js')
            paths.javascriptBundle = buildPath(
                pack,
                'js',
                'bootstrap.bundle.min.js',
            )
            paths.javascriptEsm = buildPath(pack, 'js', 'bootstrap.esm.min.js')
            return paths
        })

        console.log(cdn)
    } catch (error) {
        console.error(error)
    }
}

getPackage('bootstrap')
    .then(onPackageVersions)
    .catch((err) => {
        console.log(err.message)
    })
