const express = require('express');
const users = express.Router();
const SQL = require('../Controllers/sql');

/* const UsersSchema = SQL.createSchema({
    username: String,
})

const UsersDB = SQL.useSchema(UsersSchema);*/

users.checkUsers = async function(){
    const fetchedUsers = await UsersDB.find({});
    return fetchedUsers;
}

users.updateUser = async function(oldValue, newValue){
    const updateUser = await UsersDB.findOneAndUpdate(oldValue, newValue);
}

module.exports = users;