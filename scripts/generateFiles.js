'use strict'
const axios = require('axios').default
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const configFile = path.resolve(__dirname, '../config/_files.yml')

const apiURL = 'https://data.jsdelivr.com/v1/package/npm'
const baseURL = `https://cdn.jsdelivr.net/npm/`
const packagesList = ['bootstrap', 'font-awesome', 'bootlint', 'bootswatch'] //'bootswatch', 'bootlint'

async function getPackage(packageName) {
    const { data } = await axios.get(`${apiURL}/${packageName}`)
    return { ...data, packageName }
}

function findFile(folder, filename) {
    const file = folder.files.find((file) => file.name == filename)
    return file
}

function writeToYml(files) {
    fs.copyFileSync(configFile, `${configFile}.bak`)

    fs.writeFileSync(
        configFile,
        yaml.dump(files, {
            lineWidth: -1,
        }),
    )
}

async function findLastBootsWatchVersion() {
    const allVersions = await getPackage('bootswatch')
    const latestVersion = await allVersions.versions[0]
    return latestVersion
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

function buildPathBootsWatch(packageData, bs4 = true) {
    const basepath = `${baseURL}${packageData.packageName}@SWATCH_VERSION`
    const distFolder = findFile(packageData, 'dist')
    let bootstrapPath = ''
    let themes
    if (distFolder) {
        themes = distFolder.files.map((theme) => {
            let path = `${basepath}/${distFolder.name}`
            const name = theme.name
            const cssFile = findFile(theme, 'bootstrap.min.css').name
            path += `/SWATCH_NAME/${cssFile}`
            bootstrapPath = path
            return {
                name: name,
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
        let path = basepath
        themes = themesNames
            .map((theme) => {
                const themeFolder = findFile(packageData, theme)
                if (themeFolder) {
                    path = `${basepath}/SWATCH_NAME`
                    const cssFile = findFile(themeFolder, 'bootstrap.min.css')
                    path += `/${cssFile.name}`
                    bootstrapPath = path
                    return { name: theme }
                    //return { name: theme }
                }
            })
            .filter((und) => und)
    }
    return { bspath: bootstrapPath, themes: themes }
}

function buildPathBootlint(packageData) {
    let basepath = `${baseURL}${packageData.packageName}@${packageData.version}/`
    const distFolder = findFile(packageData, 'dist')
    if (distFolder) {
        let path = `${basepath}${distFolder.name}`
        const browserFolder = findFile(distFolder, 'browser')
        if (browserFolder) {
            path += `/${browserFolder.name}`
            const minjsFile = findFile(browserFolder, 'bootlint.min.js')
            if (minjsFile) {
                path += `/${minjsFile.name}`
                return path
            } else {
                return false
            }
        }
    }
    return false
}

async function generateFilesPath({ versions, packageName }) {
    try {
        const filesPromises = versions.map(async (version) => {
            const res = await getPackage(`${packageName}@${version}`)
            return { ...res, version, packageName }
        })

        const files = await Promise.all(filesPromises)

        //const lastbsVersion = await findLastBootsWatchVersion()

        const versionFiles = files
            .map((file, index) => {
                const paths = { version: file.version }

                switch (file.packageName) {
                    case 'bootstrap':
                        paths.current = file.version === '4.5.2' ? true : false

                        const stylesheet = buildPath(
                            file,
                            'css',
                            'bootstrap.min.css',
                        )
                        const javascript = buildPath(
                            file,
                            'js',
                            'bootstrap.min.js',
                        )

                        if (javascript && stylesheet) {
                            paths.stylesheet = stylesheet
                            paths.javascript = javascript
                            paths.javascriptBundle = buildPath(
                                file,
                                'js',
                                'bootstrap.bundle.min.js',
                            )
                            paths.javascriptEsm = buildPath(
                                file,
                                'js',
                                'bootstrap.esm.min.js',
                            )
                        } else {
                            return false
                        }

                        break
                    case 'bootswatch':
                        paths.link = 'https://bootswatch.com/SWATCH_NAME/'
                        paths.image =
                            'https://bootswatch.com/SWATCH_NAME/thumbnail.png'
                        if (!index) {
                            const { bspath, themes } = buildPathBootsWatch(file)
                            paths.link = 'https://bootswatch.com/SWATCH_NAME/'
                            paths.image =
                                'https://bootswatch.com/SWATCH_NAME/thumbnail.png'
                            paths.bootstrap = bspath
                            paths.themes = themes.reverse()
                        } else if (file.version == '3.4.1') {
                            paths.link = 'https://bootswatch.com/3/SWATCH_NAME/'
                            paths.image =
                                'https://bootswatch.com/3/SWATCH_NAME/thumbnail.png'
                            const { bspath, themes } = buildPathBootsWatch(file)
                            paths.bootstrap = bspath
                            paths.themes = themes
                        } else {
                            return false
                        }
                        break
                    case 'font-awesome':
                        paths.current = file.version === '4.7.0' ? true : false
                        paths.stylesheet = buildPathFontAwesome(file)
                        break
                    case 'bootlint':
                        paths.current = file.version === '1.1.0' ? true : false
                        const bootlintPath = buildPathBootlint(file)

                        if (bootlintPath) {
                            paths.javascript = buildPathBootlint(file)
                        } else {
                            return false
                        }
                        break
                    default:
                        return null
                }

                Object.keys(paths).map((path) => {
                    !paths[path] && delete paths[path]
                })

                return paths
            })
            .filter((cdn) => cdn)
        //console.log(versionFiles)
        return versionFiles
    } catch (error) {
        console.error(error)
    }
}

async function main() {
    const filesPromise = packagesList.map(async (pack) => {
        const versions = await getPackage(pack)
        const versionFiles = await generateFilesPath(versions)

        return { [pack]: versionFiles }
    }, {})

    const files = await Promise.all(filesPromise)

    let filesMap = {}
    files.forEach((file) => {
        const keysName = Object.keys(file)
        if (keysName.includes('bootswatch')) {
            filesMap = { ...filesMap, bootswatch3: file.bootswatch[1] }
            filesMap = { ...filesMap, bootswatch4: file.bootswatch[0] }
        } else {
            filesMap = { ...filesMap, ...file }
        }
    })

    writeToYml(filesMap)
}

main()

module.exports = { configFile }
