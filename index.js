require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const download = require('image-downloader');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { type } = require('os');

// Init Express with body parser
const app = express();
app.use(express.json());

// start the server listening for requests, using deployment option's port or locally
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server is running..."));

// Setting up nodemailer to send to my email directly
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
});

// initializing empty objects
let nftData = {};
let lastPost = {};

// where to save everything
const storageDirectory = process.env.STORAGEDIRECTORY;
const folderName = path.join(__dirname, storageDirectory);

try {
  if(!fs.existsSync(folderName)){ fs.mkdirSync(folderName); }
} catch(err) {
  console.error(`Error creating new folder: ${err}`);
}

// setup for OpenSea.io API
const openSeaAPIUrl = `https://api.opensea.io/api/v1/assets?owner=${process.env.ETH_ADDRESS}`;
const openSeaAPIOptions = { method: 'GET' };

// get todays date
function setCurrentDate(dataObject){
  if(typeof dataObject === 'undefined'){
    console.error("No object passed to set the current date to in the setCurrentDate function");
  }

  dataObject.date = moment().format('YYYY-MM-DD');
  return dataObject;
}

// Actually fetching OpenSea.io API
function callOpenSeaAPI(){
  fetch(openSeaAPIUrl, openSeaAPIOptions)
  .then(res => res.json())
  .then(json => {
    // console.log(`This is the json data: ${JSON.stringify(json.assets[0], null, `\t`)}`);
    nftData.imageURL = json.assets[0].image_url;
    nftData.title = json.assets[0].name;
    nftData.externalLink = json.assets[0].external_link;
    nftData.description = json.assets[0].description;
    nftData.id = json.assets[0].id;
    console.log(JSON.stringify(nftData, null, `\t`));
  })
  .catch(err => console.error(`Error fetching from OpenSea API: ${err}`));
}

callOpenSeaAPI();

function downloadImageFromURL(url){
  if(typeof url === ('undefine') || url === ''){
    console.error("No URL passed to image download function");
  }

  // image downloader setup and application
  const imageDownloaderOptions = {
    url: `${url}`,
    dest: folderName,
    timeout: process.env.TIMEOUT
  }

  download.image(imageDownloaderOptions)
  .then(({ filename }) => {
    console.log("Saved to: ", filename)
  })
  .catch((err) => console.error(`Error downloading image: ${err}`));
}

function createMDXFile(data){
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
    \n
    ${data || data.description ? data.description : `No description provided.`}
    `;

  fs.writeFile(`${folderName}/index.mdx`, mdxFileContent, err => {
  if(err) {
    console.error(`Error writing new file: ${err}`);
    return;
  }
  });
} 


// nodemailer function to send email to myself whenever a new NFT is collected
async function sendFormattedNFTProject(nftInfo, callback){
  let mailOptions = {
    from: "Your NFT Alert Server | OpenSea.io API",
    to: process.env.EMAIL,
    subject: "Here is your new NFT post!",
    html: `<h1>Congrats on the new NFT!</h1>
           <p>Edgar, attached is your NFT image and data for your site</p>
           <br>
           <p>Thank you</p>`,
    attachments: [
      {
        filename: nftInfo.filename,
        path: nftInfo.path
      }
    ],
  };

  let info = await transporter.sendMail(mailOptions, function(err, info){
    if(err){
      console.error(`Error occurred sending email: ${err}`);
    } else {
      console.log("Message Sent!");
    }
  });

  callback(info);
}