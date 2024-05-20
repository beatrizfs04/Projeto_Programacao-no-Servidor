/* Requirements */
const express = require('express');
const routes = express.Router();
const SQL = require('../Controllers/sql');
const Users = require('../Controllers/users');

// Ver todos os utilizadores
routes.get('/users', async (req, res) => {
    const gotUsers = Users.checkUsers();
    res.status(200).send(gotUsers);
    res.status(400).send(`Não foi possivel aceder à informação da UsersDB.`);
})

// Ver um utilizador através do username
routes.get('/users', async (req, res) => {
    const username = req.body;
    const gotUser = Users.checkUser(username);
    res.status(200).send(gotUser);
    res.status(400).send(`Não foi possivel encontrar o utilizador com o username: ${username}.`);
})

// Criar um utilizador
routes.post('/users', async (req, res) => {
    const {username, email, password, phone} = req.body;
    const newUser = {username: username, email: email, password: password, phone: phone};
    const createdUser = Users.createUser(newUser);
    res.status(200).send(createdUser);
    res.status(400).send(`Não foi possivel acrescentar o utilizador com o username: ${username}, o email: ${email}, a password: ${password}, o phone: ${phone}.`);
})

// Atualizar os dados de um utilizador
routes.patch('/users', async (req, res) => {
    const {oldUsername, newUsername, newEmail, newPassword, newPhone} = req.body;
    const newUser = {username: newUsername, email: newEmail, password: newPassword, phone: newPhone}; 
    const oldUser = Users.checkUser(oldUsername);
    const updateUser = Users.updateUser(oldUser, newUser);
    res.status(200).send(updateUser);
    res.status(400).send(`Não foi possivel atualizar o utilizador com o username: ${username}, para o novo user: ${newUser}.`);
})

// Apagar um utilizador através do username
routes.delete('/users', async (req, res) => {
    const username = req.body;
    const deletedUser = Users.deleteUser(username);
    res.status(200).send(deletedUser);
    res.status(400).send(`Não foi possivel apagar o utulizador com o username: ${username}.`);
})

// Apagar todos os utilizadores
routes.delete('/users', async (req, res) => {
    const deletedUsers = Users.deleteUsers();
    res.status(200).send(deletedUsers);
    res.status(400).send(`Não foi possivel apagar os utilizadores.`);
})

module.exports = routes;