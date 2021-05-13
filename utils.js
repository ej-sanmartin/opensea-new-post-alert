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
    console.error(e);
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
      data.imageFileName = `${response.filename}.png`;
      data.imageFilePath = response.filename;
    } catch(e){
      console.error(e);
    }

    return data;
}

// helper function for createMDXFile 
async function createFileAsync(destination, content){
  return (await fs.writeFile(`${destination}/index.mdx`, content, err => {
    if(err) {
      console.error(err);
      return;
    }
  }));
}

// create .mdx file
async function createMDXFile(data, folderDestination){
    if(typeof data === ('undefined') || data === {}){
      console.error("Data passed is undefined or empty.");
      return data;
    }
  
    const mdxFileContent =
    `---\n
     cover: ./${data.title}.\n
     date: ${data.date}\n
     title: ${data.title}\n
     areas:\
      ${data.externalLink}\n
     ---\n
     ${data || data.description ? data.description : `No description provided.`}
    `;
  
    try {
      await createFileAsync(folderDestination, mdxFileContent);
      data.mdxFileName = `index.mdx`;
      data.mdxFilePath = `${folderDestination}/${data.mdxFileName}`;
    } catch(e) {
      console.error(e);
    }

    return data;
}

// nodemailer function called to send email with career route form
async function sendEMailAsync(data, transporter, callback){
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
      console.log("Error: " + err);
    } else {
      console.log("Message Sent!");
    }
  });

  try {
    callback(info)
  } catch(e){
    console.error(e);
  }
}
  
module.exports = {
    setCurrentDate: setCurrentDate,
    fetchAPI: fetchAPI,
    downloadImageFromURL:  downloadImageFromURL,
    createMDXFile: createMDXFile,
    sendEMailAsync: sendEMailAsync
}