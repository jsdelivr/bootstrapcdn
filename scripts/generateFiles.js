'use strict'
const axios = require('axios').default
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const configFile = path.resolve(__dirname, './_files.yml')

const apiURL = 'https://data.jsdelivr.com/v1/package/npm'
const baseURL = `https://cdn.jsdelivr.net/npm/`
const packagesList = ['bootstrap', 'font-awesome', 'bootlint'] //'bootswatch', 'bootlint'

async function getPackage(packageName) {
    const { data } = await axios.get(`${apiURL}/${packageName}`)
    return { ...data, packageName }
}

function findFile(folder, filename) {
    const file = folder.files.find((file) => file.name == filename)
    return file
}

function writeToYml(files) {
    const configFile = path.resolve(__dirname, './_files.yml')

    fs.copyFileSync(configFile, `${configFile}.bak`)

    fs.writeFileSync(
        configFile,
        yaml.dump(files, {
            lineWidth: -1,
        }),
    )
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
        ? `${baseURL}${packageData.packageName}@${packageData.version}${packageData.default}`
        : false
}

async function generateFilesPath({ versions, packageName }) {
    try {
        const filesPromises = versions.map(async (version) => {
            const res = await getPackage(`${packageName}@${version}`)
            return { ...res, version, packageName }
        })

        const files = await Promise.all(filesPromises)

        const versionFiles = files
            .map((file) => {
                const paths = { version: file.version }

                switch (file.packageName) {
                    case 'bootstrap':
                        paths.stylesheet = buildPath(
                            file,
                            'css',
                            'bootstrap.min.css',
                        )
                        paths.javascript = buildPath(
                            file,
                            'js',
                            'bootstrap.min.js',
                        )
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
                        break

                    case 'bootswatch':
                        paths.themes = buildPathBootsWatch(file)
                        break
                    case 'font-awesome':
                        paths.stylesheet = buildPathFontAwesome(file)
                        break
                    case 'bootlint':
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
        filesMap = { ...filesMap, ...file }
    })

    writeToYml(filesMap)
    //console.log(filesMap)
}

main()

<<<<<<< HEAD


=======
>>>>>>> b85146f914a27094798f82197b3bfb08c9dd3622
module.exports = { configFile }
