const fetch = require('node-fetch');
const download = require('image-downloader');
const moment = require('moment');
const fs = require('fs');

// get todays date and sets it to object passed into this
function setCurrentDate(data){
    if(typeof data === 'undefined'){
      console.error("No object passed to set the current date to in the setCurrentDate function");
      return data;
    }
  
    data.date = moment().format('YYYY-MM-DD');
    return data;
}
  
// fetches an API and returns mutated object that was passed into this function
function fetchAPI(data, url, options){
    fetch(url, options)
    .then(res => res.json())
    .then(json => {
        data.imageURL = json.assets[0].image_url;
        data.title = json.assets[0].name;
        data.externalLink = json.assets[0].external_link;
        data.description = json.assets[0].description;
        data.id = json.assets[0].id;

        // console.log(JSON.stringify(data));

        return data;
    })
    .catch(err => console.error(`Error fetching from OpenSea API: ${err}`));
}

// image downloader setup and application
function downloadImageFromURL(url, folderDestination){
    if(typeof url === ('undefine') || url === ''){
      console.error("No URL passed to image download function");
      return;
    }
  
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
  
// create .mdx file
function createMDXFile(data, folderDestination){
    if(typeof data === ('undefined') || data === {}){
      console.error("Data passed is undefined or empty.");
      return;
    }
  
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