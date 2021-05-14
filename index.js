require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const { setCurrentDate,
        fetchAPI,
        downloadImageFromURL,
        createMDXFile,
        sendEMailAsync } = require('./utils.js');

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
let nftData = {};
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
  async () => {
    try {
      nftData = await(fetchAPI(nftData, openSeaAPIUrl, openSeaAPIOptions));
      nftData.date = setCurrentDate();
      nftData = await(downloadImageFromURL(nftData.imageURL, folderName, nftData));
      nftData = await(createMDXFile(nftData, folderName));
      if(nftData.id != lastPostID){
        sendEMailAsync(nftData, transporter, info => console.log("Request Sent!"));
      } else {
        console.log("Did not send an email this time.");
      }
    } catch(e){
      console.error(console.err(`Error occurred with task: ${e}`));
    } finally {
      lastPostID = nftData.id;
      // after 5 secs, plenty of time to email contents, file will be destroyed from diskStorage to not overload space
      setTimeout(function(){ fse.emptyDirSync(storageDirectory) }, 5000);
    }
  },
  (err) => { console.error(`Roadblock hit: ${err}`); }
);

const job = new SimpleIntervalJob({ seconds: parseInt(process.env.SECONDS, 10) }, task );
scheduler.addSimpleIntervalJob(job);