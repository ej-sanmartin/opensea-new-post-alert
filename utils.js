const fetch = require('node-fetch');
const download = require('image-downloader');
const moment = require('moment');
const fs = require('fs');

// get todays date and sets it to object passed into this
function setCurrentDate(){
    return moment().format('YYYY-MM-DD');
}
  
// helper function for fetchAPI
async function loadAPIAsync(url, options){
  return (await fetch(url, options)).json();
}

// fetches an API and returns mutated object that was passed into this function
async function fetchAPI(data, url, options){
  try {
    response = await loadAPIAsync(url, options);
    data.imageURL = response.assets[0].image_url;
    data.title = response.assets[0].name;
    data.externalLink = response.assets[0].external_link;
    data.description = response.assets[0].description;
    data.id = response.assets[0].id;
  } catch(e) {
    console.error(`Error caught fetching from API: ${e}`);
  }

  return data;
}

// downloadImageFromURL helper function
async function downloadImageAsync(options){
  return (await download.image(options));
}

// image downloader setup and application
async function downloadImageFromURL(url, folderDestination, data){
    if(typeof url === ('undefine') || url === ''){
      console.error("No URL passed to image download function");
      return data;
    }
  
    const imageDownloaderOptions = {
      url: `${url}`,
      dest: folderDestination,
      timeout: parseInt(process.env.TIMEOUT, 10)
    }

    try {
      response = await downloadImageAsync(imageDownloaderOptions);
      data.imageFileName = `${response.filename}.jpg`;
      data.imageFilePath = response.filename;
    } catch(e){
      console.error(`Error caught while downloading image from URL: ${e}`);
    }

    return data;
}

// helper function for createMDXFile 
async function createFileAsync(destination, content){
  return (await fs.writeFile(`${destination}/index.mdx`, content, err => {
    if(err) {
      console.error(`Error occurred while file was being written in async function: ${err}`);
      return;
    }
  }));
}

// create .mdx file
async function createMDXFile(data, folderDestination){
    if(typeof data === ('undefined') || data === {}){
      console.error("Data passed to create .mdx file is undefined or empty.");
      return data;
    }
  
    const mdxFileContent =
    `---\n
cover: "./${data.title}"\n
date: "${data.date}"\n
title: "${data.title}"\n
areas:\n
  -${data.externalLink}\n
---\n
${data || data.description ? data.description : `No description provided.`}
    `;
  
    try {
      await createFileAsync(folderDestination, mdxFileContent);
      data.mdxFileName = `index.mdx`;
      data.mdxFilePath = `${folderDestination}/${data.mdxFileName}`;
    } catch(e) {
      console.error(`Error caught trying to create .mdx file: ${e}`);
    }

    return data;
}

// nodemailer function called to send email with career route form
async function sendEMailAsync(data, transporter, callback){
  let mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: "Here is your new NFT post!",
    html: `
    <div style="margin-left: 1em;">
      <h1>Congrats on the new NFT!</h1>
      <p style="font-size: 1.15em">Edgar, attached is your NFT image and data for your site</p>
      <br>
      <p style="font-size: 1.15em">Thank you!</p>
    </div>`,
    attachments: [
      {
        filename: data.imageFileName,
        path: data.imageFilePath
      },
      {
        filename: data.mdxFileName,
        path: data.mdxFilePath
      }
    ]
  };

  let info = await transporter.sendMail(mailOptions, function(err, info){
    if(err){
      console.log("Error while sending mail from transporter function: " + err);
    } else {
      console.log("Message Sent!");
    }
  });

  try {
    callback(info)
  } catch(e){
    console.error(`Error in callback of sending mail function: ${e}`);
  }
}
  
module.exports = {
    setCurrentDate: setCurrentDate,
    fetchAPI: fetchAPI,
    downloadImageFromURL:  downloadImageFromURL,
    createMDXFile: createMDXFile,
    sendEMailAsync: sendEMailAsync
}