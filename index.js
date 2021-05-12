require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const download = require('image-downloader');
const fs = require('fs');
const path = require('path');

/* Next few lines are just standard boiler plate code for an express app */

// Init Express with body parser
const app = express();
app.use(express.json());

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

// fetching from OpenSea.io API
const openSeaAPIUrl = ``;
const openSeaAPIOptions = { method: 'GET', headers: {Accept: 'application/json'}};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));

// where to save everything
const storageDirectory = process.env.STORAGEDIRECTORY;

// image downloader setup and application
const imageDownloaderOptions = {
  url: ``,
  dest: storageDirectory,
  timeout: process.env.TIMEOUT
}

download.image(imageDownloaderOptions)
  .then(({ filename }) => {
    console.log("Saved to ", filename)
  })
  .catch((err) => console.log(err));

// start the server listening for requests, using deployment option's port or locally
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server is running..."));