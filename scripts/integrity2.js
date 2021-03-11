'use strict'

const axios = require('axios').default

const apiURL = 'https://data.jsdelivr.com/v1/package/npm'
const packagesNameList = ['bootstrap', 'bootswatch', 'bootlint', 'fontawesome']

async function getPackage(packageName) {
    const { data } = await axios.get(`${apiURL}/${packageName}`)
    return { ...data, packageName }
}

function findFile(folder, filename) {
    const file = folder.files.find((file) => file.name == filename)
    return file
}

function buildPath(packageData, ext, filename) {
    const baseURL = `https://cdn.jsdelivr.net/npm/${packageData.packageName}`
    let path = `${baseURL}@${packageData.version}/`
    const dir = findFile(packageData, 'dist')
    if (dir) {
        path += dir.name
        const extensionFolder = findFile(dir, ext)
        if (extensionFolder) {
            path += `/${extensionFolder.name}`
            const file = findFile(extensionFolder, filename)
            if (file) {
                path += `/${file.name}`
            } else {
                return undefined
            }
        }
        return path
    }
}

async function onPackageVersions({ versions, packageName }) {
    try {
        const promises = versions.map(async (version) => {
            const res = await getPackage(`${packageName}@${version}`)
            return { ...res, version, packageName }
        })

        const packages = await Promise.all(promises)

        const cdn = packages.map((pack) => {
            const paths = { version: pack.version }
            paths.stylesheet = buildPath(pack, 'css', 'bootstrap.min.css')
            paths.javascript = buildPath(pack, 'js', 'bootstrap.min.js')
            paths.javascriptBundle = buildPath(
                pack,
                'js',
                'bootstrap.bundle.min.js',
            )
            paths.javascriptEsm = buildPath(pack, 'js', 'bootstrap.esm.min.js')

            Object.keys(paths).map((path) => {
                !paths[path] && delete paths[path]
            })

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

// packagesNameList.map((p) => {
//     getPackage(p).then((res) => {
//         onPackageVersions(res, p)
//     })
// })
