const express = require('express');
const users = express.Router();
const SQL = require('../Controllers/sql');

/* const UsersSchema = SQL.createSchema({
    username: String,
}) */

users.checkUsers = async function(){
    const fetchedUsers = await SQL.find({});
    return fetchedUsers;
}

users.updateUser = async function(oldValue, newValue){
    const updateUser = await SQL.findOneAndUpdate(oldValue, newValue);
}

module.exports = users;