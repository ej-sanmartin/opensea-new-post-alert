# OpenSea New Post Alert

## Description

Simply fetches and emails me data from OpenSea API about my account. The data is a particularly formatted MDX file and some images. Then, on a weekly basis, will check for changes in my account

## Implementation

- May 12, 2021

Still trying to work out the details, but preferably I would only use a library such as agenda to get to be able to listen for changes in the API. "Worst case" can create a MongoDB and upload the data from the API there, then check for changes on that API on a weekly base. Weighing my options

- May 13, 2021

So was able to get all the pieces of the code to work separately but now comes the challenge trying to put all those functionalities in a schedule function.  Main issue currently is that the promise chain used has a "catch is undefined" error which is troublesome because there are both try-catch blocks and catch functions in that function. Will have to investigate some more. Did get to break up my index.js file, it was getting way too big. Also going to integrate testing with Jest when this is over. 

- Later on in May 13, 2021

The multiple chaining of promises and teh complexity of trying to wait for return values to be fulfilled on time had made me change to an "async/await" approach. I chose this because I needed the nftData object to have its items guaranteed to be populated when ran through a fetch API or any function that added information to the object. Without this, downloading images and formatting the .mdx would not work since the object would still be empty from trying to finish completing its asynchronous task. The new solution was much more cleaner and was able to work after a repetitive conversion from a Promise implementation to an Async/Await one.

## Purpose

The Gatsby Theme I am using didn't have many easy ways to fetch an API to the site itself (Wrapping a GraphQL around a RestFul Service). So instead of manually uploading all new posts, I will just get an email notifying me of the new posts and format them nicely for me so that they are ready to be added to the site.


## Tech

- Express
- Fetch
- Image-Downloader
- Toad-Scheduler
- Moment
- Nodemailer
- fs-extra
- Knex
- SQLite3
- PostgreSQL


## Contributions

- Edgar Jr San Martin (only one working on this)


## Copyright

© Edgar Jr San Martin 2021