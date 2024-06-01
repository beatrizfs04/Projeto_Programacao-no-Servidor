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
            validator: function (v) {
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
    permission: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    }
}, "users")

const UsersDB = SQL.useSchema(users.UsersSchema, "users");


// Procura todos os utilizadores na BD
users.getAllUsers = async function () {
    const gotUsers = await UsersDB.find({});
    return gotUsers;
}

// Procura um utilizador na BD pelo seu username
users.getUserByUsername = async function (userName) {
    const gotUser = await UsersDB.findOne({ username: userName });
    return gotUser;
}

// Procura um utilizador na BD pelo seu id
users.getUserById = async function (userId) {
    const gotUser = await UsersDB.findOne({ _id: userId });
    return gotUser;
}

// Atualiza um utilizador na BD pelo id
users.updateUserById = async function (userId, newUser) {
    const updatedUser = await UsersDB.findOneAndUpdate({ _id: userId }, newUser, { new: true });
    return updatedUser;
}

// Atualiza um utilizador na BD pelo username
users.updateUserByUsername = async function (userName, newUser) {
    const updatedUser = await UsersDB.findOneAndUpdate({ username: userName }, newUser, { new: true });
    return updatedUser;
}

// Cria um utilizador na BD pelos valores no body
users.createUser = async function (newUserData) {
    const newUser = UsersDB({ username: newUserData.username, email: newUserData.email, password: newUserData.password, phone: newUserData.phone });
    const createdUser = await newUser.save();
    return createdUser;
}

// Apaga um utilizador da BD pelo seu username
users.deleteUserByUsername = async function (userName) {
    const deletedUser = await UsersDB.findOneAndDelete({ username: userName });
    return deletedUser;
}

// Apaga um utilizador da BD pelo seu id
users.deleteUserById = async function (userId) {
    const deletedUser = await UsersDB.findOneAndDelete({ _id: userId });
    return deletedUser;
}

// Apaga todos os utilizadores da BD
users.deleteAllUsers = async function () {
    const deletedUsers = await UsersDB.deleteMany({});
    return deletedUsers;
}

users.loginUser = async function (username, password) {
    
    const user = await users.getUserByUsername(username);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {

        try {
            const token = jwt.sign(
                {
                    username: user.username,
                    password: user.password
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