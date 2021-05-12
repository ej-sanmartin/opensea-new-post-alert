require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const download = require('image-downloader');
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

// constructor method for data to be retrieved from API
function NFT(imageURL, date, title, externalLink, description){
  this.imageURL = imageURL;
  this.date = date;
  this.title = title;
  this.externalLink = externalLink;
  this.description = description;
}

// where to save everything
const storageDirectory = process.env.STORAGEDIRECTORY;

// fetching from OpenSea.io API
const openSeaAPIUrl = ``;
const openSeaAPIOptions = { method: 'GET', headers: {Accept: 'application/json'}};

fetch(url, options)
  .then(res => res.json())
  .then(json => {
    console.log(json)
  })
  .catch(err => console.error(`Error fetching from OpenSea API: ${err}`));

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
  .catch((err) => console.error(`Error downloading image :${err}`));

// create .mdx file
const mdxFileContent = `
  ---\n
  cover: ${imageURL}\n
  date: ${date}\n
  title: ${title}\n
  areas:\n
    ${externalLink}\n
  ---\n
  \n
  ${description}
`;

try {
  const data = fs.writeFileSync(`${storageDirectory}/index.mdx`, mdxFileContent);
  console.log(`Successfully created mdx file! Here are its contents: ${mdxFileContent} \n Here is the code that was ran through: ${data}`);
} catch(err){
  console.error()
}

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