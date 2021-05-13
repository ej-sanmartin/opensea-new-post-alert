require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { setCurrentDate,
        fetchAPI,
        downloadImageFromURL,
        createMDXFile } = require('./utils.js');

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

// initializing API data variables
let nftData = {};
let lastPostID = ``;

// where to save everything
const storageDirectory = process.env.STORAGEDIRECTORY;
const folderName = path.join(__dirname, storageDirectory);

// create folder to keep all of the files we will be creating
try {
  if(!fs.existsSync(folderName)){ fs.mkdirSync(folderName); }
} catch(err) {
  console.error(`Error creating new folder: ${err}`);
}

// setup for OpenSea.io API
const openSeaAPIUrl = `https://api.opensea.io/api/v1/assets?owner=${process.env.ETH_ADDRESS}`;
const openSeaAPIOptions = { method: 'GET' };

fetchAPI(nftData, openSeaAPIUrl, openSeaAPIOptions);

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
