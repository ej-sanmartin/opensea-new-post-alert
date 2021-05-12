require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const download = require('image-downloader');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

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

// initializing empty object
let nftData = {};

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
nftData.date = moment().format('YYYY-MM-DD');

// Actually fetching OpenSea.io API
function callOpenSeaAPI(){
  fetch(openSeaAPIUrl, openSeaAPIOptions)
  .then(res => res.json())
  .then(json => {
    console.log(json);
    // nftData.imageURL = json.image_url;
    // nftData.title = json.name;
    // nftData.externalLink = json.external_link;
    // nftData.description = json.description;
  })
  .catch(err => console.error(`Error fetching from OpenSea API: ${err}`));
}

callOpenSeaAPI();

// image downloader setup and application
const imageDownloaderOptions = {
  url: `${nftData.imageURL}`,
  dest: folderName,
  timeout: process.env.TIMEOUT
}

download.image(imageDownloaderOptions)
  .then(({ filename }) => {
    console.log("Saved to ", filename)
  })
  .catch((err) => console.error(`Error downloading image :${err}`));

// create .mdx file
const mdxFileContent = `
  ---\n
  cover: ./${nftData.title}.\n
  date: ${nftData.date}\n
  title: ${nftData.title}\n
  areas:\
    ${nftData.externalLink}\n
  ---\n
  \n
  ${nftData || nftData.description ? nftData.description : ``}
`;

fs.writeFile(`${folderName}/index.mdx`, mdxFileContent, err => {
  if(err) {
    console.error(`Error writing new file: ${err}`);
    return;
  }
});


// nodemailer function to send email to myself whenever a new NFT is collected
async function sendFormattedNFTProject(nftInfo, callback){
  let mailOptions = {
    from: "Your NFT Alert server | OpenSea.io API",
    to: process.env.EMAIL,
    subject: "Here is your updated NFT collection!",
    html: `<h1>Edgar, attached is your NFT image and data for your site<br>
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