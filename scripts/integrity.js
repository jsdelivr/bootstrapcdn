"use strict";

const axios = require("axios").default;

const baseURL = "https://data.jsdelivr.com/v1/package/npm";

async function getPackage(packageName) {
    const { data } = await axios.get(`${baseURL}/${packageName}`);
    return data;
}

function findFile(folder,filename){
    const file=folder.files.find(f=>f.name==filename);
    return file!=undefined ? file : false;
}

function buildPath(packageData,ext,filename){
    let path=`${packageData.version}/`;;
    const dir=findFile(packageData,"dist");
    if(dir){
        path+=dir.name;
        const jsFiles=findFile(dir,ext);
        if(jsFiles){
            path+=`/${jsFiles.name}`;
            const jsFile=findFile(jsFiles,filename);
            if(jsFiles){
                path+=`/${jsFile.name}`;
            }
        }
        return path;
    }
    

}

async function onPackageVersions({ versions }) {
    try {
        const promises = versions.map(async (version) => {

            const res= await getPackage(`bootstrap@${version}`);
            return {...res,version};
        });

        const packages = await Promise.all(promises);

        const cdn=packages.map(x=>{
            const pathsObj={};
            pathsObj.stylesheet=buildPath(x,"css","bootstrap.min.css");
            pathsObj.javascript=buildPath(x,"js","bootstrap.min.js");
            pathsObj.javascriptBundle=buildPath(x,"js","bootstrap.bundle.min.js");
            pathsObj.javascriptEsm=buildPath(x,"js","bootstrap.esm.min.js");
            return pathsObj;
        })
        console.log(cdn);

    } catch (error) {
        console.error(error);
    }
}

getPackage("bootstrap")
    .then(onPackageVersions)
    .catch((err) => {
        console.log(err.message);
    });