require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
var _ = require('lodash');
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const { setCurrentDate,
        fetchAPI,
        downloadImageFromURL,
        createMDXFile } = require('./utils.js');

// init Express with its own body parser
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
let nftData = {
  date: ''
};
let lastPostID = ``;

// where to save everything
const storageDirectory = process.env.STORAGEDIRECTORY;
const folderName = path.join(__dirname, storageDirectory);

// creates and make sure folder to keep all of the files exists
try {
  if(!fs.existsSync(folderName)){ fs.mkdirSync(folderName); }
} catch(err) {
  console.error(`Error creating new folder: ${err}`);
}

// setup for OpenSea.io API
const openSeaAPIUrl = `https://api.opensea.io/api/v1/assets?owner=${process.env.ETH_ADDRESS}`;
const openSeaAPIOptions = { method: 'GET' };

// initialize and setup scheduler
const scheduler = new ToadScheduler();
const task = new AsyncTask(
  'simple task',
  () => {

      return new Promise((resolve, reject) => {
        nftData = fetchAPI(nftData, openSeaAPIUrl, openSeaAPIOptions);
        resolve(nftData);
      })
      .then((result) => {
        result = setCurrentDate(result);
        return result;
      })
      .then((result) => {
        result = downloadImageFromURL(result.imageUrl, folderName);
        return result;
      })
      .then((result) => {
        result = createMDXFile(result, folderName);
        return result;
      })
      .then((result) => {
        //if(result.id != lastPostID){
          //console.log("Almost done setting up e-mail!");
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
                filename: result.imageFileName,
                path: result.imageFilePath
              },
              {
                filename: result.mdxFileName,
                path: result.mdxFilePath
              }
            ]
          };
          nftData = _.clone(result);
          return mailOptions;
        //} else { console.log("Did not send email this time."); }
      })
      .then(function(result){
        let info = transporter.sendMail(result)
        .then((okay) => {
          return okay;
        })
        .catch((error) => {
          console.error(error);
        });
        return nftData;
      })
      .then((result) => {
        lastPostID = result.id;
        return result;
      })
      .catch((err) => {
        console.error(err);
      });
  
  },
  (err) => { console.error(`Roadblock hit: ${err}`); }
);
const job = new SimpleIntervalJob({ seconds: 10 }, task );
scheduler.addSimpleIntervalJob(job);