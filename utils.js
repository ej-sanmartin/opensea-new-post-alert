const fetch = require('node-fetch');
const download = require('image-downloader');
const moment = require('moment');
const fs = require('fs');

// get todays date
function setCurrentDate(dataObject){
    if(typeof dataObject === 'undefined'){
      console.error("No object passed to set the current date to in the setCurrentDate function");
    }
  
    dataObject.date = moment().format('YYYY-MM-DD');
    return dataObject;
}
  
// Actually fetching OpenSea.io API
function fetchAPI(nftData, url, options){
    fetch(url, options)
    .then(res => res.json())
    .then(json => {
        nftData.imageURL = json.assets[0].image_url;
        nftData.title = json.assets[0].name;
        nftData.externalLink = json.assets[0].external_link;
        nftData.description = json.assets[0].description;
        nftData.id = json.assets[0].id;

        // console.log(JSON.stringify(nftData));

        return nftData;
    })
    .catch(err => console.error(`Error fetching from OpenSea API: ${err}`));
}
  
function downloadImageFromURL(url, folderDestination){
    if(typeof url === ('undefine') || url === ''){
      console.error("No URL passed to image download function");
    }
  
    // image downloader setup and application
    const imageDownloaderOptions = {
      url: `${url}`,
      dest: folderDestination,
      timeout: process.env.TIMEOUT
    }
  
    download.image(imageDownloaderOptions)
    .then(({ filename }) => {
      console.log("Saved to: ", filename)
    })
    .catch((err) => console.error(`Error downloading image: ${err}`));
}
  
function createMDXFile(data, folderDestination){
    if(typeof data === ('undefined') || data === {}){
      console.error("Data passed is undefined or empty.");
      return;
    }
  
    // create .mdx file
    const mdxFileContent = ` ---\n
        cover: ./${data.title}.\n
        date: ${data.date}\n
        title: ${data.title}\n
        areas:\
            ${data.externalLink}\n
        ---\n
        ${data || data.description ? data.description : `No description provided.`}
    `;
  
    fs.writeFile(`${folderDestination}/index.mdx`, mdxFileContent, err => {
    if(err) {
      console.error(`Error writing new file: ${err}`);
      return;
    }
    });
} 
  
module.exports = {
    setCurrentDate: setCurrentDate,
    fetchAPI: fetchAPI,
    downloadImageFromURL:  downloadImageFromURL,
    createMDXFile: createMDXFile,
}