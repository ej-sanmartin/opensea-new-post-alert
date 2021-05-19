const db = require('../dbConfig');

async function add(image_id){
    await db('images').insert({open_sea_id: image_id});
}

async function isTableEmpty(){
    return await db('images').count('open_sea_id');
}

async function findMostRecentID(){
    return await db('images')
                           .select('open_sea_id')
                           .orderBy('id', 'desc')
                           .limit(1);
}

module.exports = {
    add,
    isTableEmpty,
    findMostRecentID
}