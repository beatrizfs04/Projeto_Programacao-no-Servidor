/* Requirements */
const express = require('express');
const routes = express.Router();
const SQL = require('../Controllers/sql');
const Users = require('../Controllers/users');

// Ver todos os utilizadores
routes.get('/users', async (req, res) => {
    try{
        const gotUsers = Users.checkUsers();
        res.status(200).send(gotUsers);        
    } catch {
        res.status(400).send(`Não foi possivel aceder à informação da UsersDB.`);        
    }
})

// Ver um utilizador através do username
routes.get('/users', async (req, res) => {
    const username = req.body;
    try {
        const gotUser = Users.checkUser(username);
        res.status(200).send(gotUser);
    } catch {
        res.status(400).send(`Não foi possivel encontrar o utilizador com o username: ${username}.`);        
    }
})

// Criar um utilizador
routes.post('/users', async (req, res) => {
    const {username, email, password, phone} = req.body;
    try {
        const existUser = Users.checkUser(username);
        res.status(400).send(`Já existe um utilizador com o username: ${username}`);
    } catch {
        try {
            const newUser = {username: username, email: email, password: password, phone: phone};
            const createdUser = Users.createUser(newUser);
            res.status(200).send(createdUser);
        } catch {
            res.status(400).send(`Não foi possivel acrescentar o utilizador com o username: ${username}, o email: ${email}, a password: ${password}, o phone: ${phone}.`);
        }
    }
})

// Atualizar os dados de um utilizador
routes.patch('/users', async (req, res) => {
    const {oldUsername, newUsername, newEmail, newPassword, newPhone} = req.body;
    try {
        const newUser = {username: newUsername, email: newEmail, password: newPassword, phone: newPhone}; 
        const oldUser = Users.checkUser(oldUsername);
        const updateUser = Users.updateUser(oldUser, newUser);
        res.status(200).send(updateUser);
    } catch {
        res.status(400).send(`Não foi possivel atualizar o utilizador com o username: ${username}, para o novo user: ${newUser}.`);
    }
})

// Apagar um utilizador através do username
routes.delete('/users', async (req, res) => {
    const username = req.body;
    try {
        const deletedUser = Users.deleteUser(username);
        res.status(200).send(deletedUser);
    } catch {
        res.status(400).send(`Não foi possivel apagar o utulizador com o username: ${username}.`);        
    }
})

// Apagar todos os utilizadores
routes.delete('/users', async (req, res) => {
    try {
        const deletedUsers = Users.deleteUsers();
        res.status(200).send(deletedUsers);
    } catch {
        res.status(400).send(`Não foi possivel apagar os utilizadores.`);
    }
})

// Login de Utilizadores
routes.post('/login', async (req, res) => {
    const {username , password} = req.body;
    try {
        const gotUser = Users.checkUser(username);
        if (gotUser.password == password) {
            res.status(200).send(gotUser);
        } else {
            res.status(400).send("Incorrect Password.");
        }
    } catch {
        res.status(404).send("Username Not Found.");
    }
})

module.exports = routes;