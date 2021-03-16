'use strict'

const axios = require('axios').default

const apiURL = 'https://data.jsdelivr.com/v1/package/npm'
const baseURL = `https://cdn.jsdelivr.net/npm/`
const packagesNameList = ['font-awesome', 'bootstrap', 'bootswatch', 'bootlint']

async function getPackage(packageName) {
    const { data } = await axios.get(`${apiURL}/${packageName}`)
    return { ...data, packageName }
}

function findFile(folder, filename) {
    const file = folder.files.find((file) => file.name == filename)
    return file
}

function makePackagesObject(packsArr) {
    const packagesNameObj = {
        'font-awesome': [],
        bootstrap: [],
        bootswatch: [],
        bootlint: [],
    }
    packsArr.map((pack) => {
        packagesNameObj[pack.n] = pack.v
    })
    return packagesNameObj
}

function buildPath(packageData, ext, filename) {
    let path = `${baseURL}${packageData.packageName}@${packageData.version}/`
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
    return false
}

function buildPathFontAwesome(packageData) {
    let path = `${baseURL}${packageData.packageName}@${packageData.version}/`
    const cssFolder = findFile(packageData, 'css')
    path += cssFolder.name
    const cssFile = findFile(cssFolder, 'font-awesome.min.css')
    path += `/${cssFile.name}`
    return path
}

function buildPathBootsWatch(packageData) {
    const basepath = `${baseURL}${packageData.packageName}@${packageData.version}`
    const distFolder = findFile(packageData, 'dist')
    let themes
    if (distFolder) {
        let path = `${basepath}/${distFolder.name}`
        themes = distFolder.files.map((theme) => {
            const name = theme.name
            const cssFile = findFile(theme, 'bootstrap.min.css').name
            return {
                name: name,
                stylesheet: `${path}/${name}/${cssFile}`,
            }
        })
    } else {
        const themesNames = [
            'cerulean',
            'cosmo',
            'cyborg',
            'darkly',
            'flatly',
            'journal',
            'litera',
            'lumen',
            'lux',
            'materia',
            'minty',
            'pulse',
            'sandstone',
            'simplex',
            'sketchy',
            'slate',
            'solar',
            'spacelab',
            'superhero',
            'united',
            'yeti',
        ]
        themes = themesNames
            .map((theme) => {
                const themeFolder = findFile(packageData, theme)
                if (themeFolder) {
                    let path = `${basepath}/${themeFolder.name}`
                    const cssFile = findFile(themeFolder, 'bootstrap.min.css')
                    path += `/${cssFile.name}`
                    return { name: theme, stylesheet: path }
                }
            })
            .filter((und) => und)
    }
    return themes
}

function buildPathBootlint(packageData) {
    return packageData.default
        ? `${baseURL}/${packageData.packageName}@${packageData.version}${packageData.default}`
        : false
}

async function onPackageVersions({ versions, packageName }) {
    try {
        const promises = versions.map(async (version) => {
            const res = await getPackage(`${packageName}@${version}`)
            return { ...res, version, packageName }
        })

        const packages = await Promise.all(promises)

        const cdn = packages
            .map((pack) => {
                const paths = { version: pack.version }
                //Start switch
                switch (pack.packageName) {
                    case 'bootstrap':
                        paths.stylesheet = buildPath(
                            pack,
                            'css',
                            'bootstrap.min.css',
                        )
                        paths.javascript = buildPath(
                            pack,
                            'js',
                            'bootstrap.min.js',
                        )
                        paths.javascriptBundle = buildPath(
                            pack,
                            'js',
                            'bootstrap.bundle.min.js',
                        )
                        paths.javascriptEsm = buildPath(
                            pack,
                            'js',
                            'bootstrap.esm.min.js',
                        )

                        Object.keys(paths).map((path) => {
                            !paths[path] && delete paths[path]
                        })
                        break
                    case 'bootswatch':
                        paths.themes = buildPathBootsWatch(pack)
                        break
                    case 'font-awesome':
                        paths.stylesheet = buildPathFontAwesome(pack)
                        break
                    case 'bootlint':
                        const bootlintPath = buildPathBootlint(pack)
                        if (bootlintPath) {
                            paths.javascript = buildPathBootlint(pack)
                        } else {
                            return false
                        }
                        break
                    default:
                        return null
                }
                //End switch
                return paths
            })
            .filter((cdn) => cdn)

        return cdn
    } catch (error) {
        console.error(error)
    }
}

// getPackage('font-awesome')
//     .then(onPackageVersions)
//     .catch((err) => {
//         console.log(err.message)
//     })
const allPaths = packagesNameList.map(async (p) => {
    const versions = await getPackage(p)
    const packPaths = await onPackageVersions(versions)
    return { n: p, v: packPaths }
})

Promise.all(allPaths)
    .then((res) => {
        const packageObj = makePackagesObject(res)
        console.log(packageObj)
    })
    .catch((err) => {
        console.log(err.message)
    })
