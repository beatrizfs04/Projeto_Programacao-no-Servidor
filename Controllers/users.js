const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const users = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Users
users.UsersSchema = SQL.createSchema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [4, 'Tamanho minimo é 4.'],
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: props => '${props.value} não é um endereço de e-mail válido!'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Tamanho minimo é 8.'],
    },
    phone: {
        type: Number,
        required: true,
        minlength: [9, 'Tamanho minimo é 9.'],
        maxlength: [9, 'Tamanho máximo é 9.'],
    },
}, "users")

const UsersDB = SQL.useSchema(users.UsersSchema, "users");


// Procura todos os utilizadores na BD
users.checkUsers = async function(){
    const gotUsers = await UsersDB.find({});
    return gotUsers;
}

// Procura um utilizador na BD pelo seu username
users.checkUser = async function(username){
    const gotUser = await UsersDB.findOne({username});
    return gotUser;
}

// Atualiza um utilizador na BD pelos valores no body
users.updateUser = async function(oldUser, newUser){
    const updatedUser = await UsersDB.findOneAndUpdate(oldUser, newUser, { new: true });
    return updatedUser;
}

// Cria um utilizador na BD pelos valores no body
users.createUser = async function(newUserData){
    const newUser = UsersDB({username: newUserData.username, email: newUserData.email, password: newUserData.password, phone: newUserData.phone});
    const createdUser = await newUser.save();
    return createdUser;
}

// Apaga um utilizador da BD pelo seu username
users.deleteUser = async function(username){
    const deletedUser = await UsersDB.findOneAndDelete(username);
    return deletedUser;
}

// Apaga todos os utilizadores da BD
users.deleteUsers = async function(){
    const deletedUsers = await UsersDB.deleteMany({});
    return deletedUsers;
}

users.loginUser = async function(gotUser, gotPassword) {
    const User = gotUser

    const passwordMatch = await bcrypt.compare(gotPassword, User.password);
    if (passwordMatch) {
        let token
        try {
            token = jwt.sign(
                {
                    username: User.username,
                    password: User.password
                },
                "prgserver",
                { expiresIn: "1h" }
            )

            return token;
        } catch (err) {
            throw err;
        }
    } else {
        return false;
    }
}

module.exports = users;