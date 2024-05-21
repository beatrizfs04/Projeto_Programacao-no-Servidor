/* Requirements */
const express = require('express');
const routes = express.Router();
const jwt = require("jsonwebtoken");
const SQL = require('../Controllers/sql');
const Users = require('../Controllers/users');

// Ver todos os utilizadores
routes.get('/users', async (req, res) => {
    try {
        const gotUsers = await Users.checkUsers();
        res.status(200).send(gotUsers);
    } catch {
        res.status(400).send(`Não foi possivel aceder à informação da UsersDB.`);
    }
})

// Ver um utilizador através do username
routes.get('/users', async (req, res) => {
    const username = req.body;
    try {
        const gotUser = await Users.checkUser(username);
        res.status(200).send(gotUser);
    } catch {
        res.status(400).send(`Não foi possivel encontrar o utilizador com o username: ${username}.`);
    }
})

// Criar um utilizador
routes.post('/users', async (req, res) => {
    const { username, email, password, phone } = req.body;
    try {
        const existUser = await Users.checkUser(username);

        if (existUser.length > 0)
            return res.status(400).send(`Já existe um utilizador com o username: ${username}`);

        const newUser = { username: username, email: email, password: password, phone: phone };
        const createdUser = await Users.createUser(newUser);
        return res.status(200).send(createdUser);

    } catch (err) {
        res.status(400).send(`${err.message}`);
    }
})

// Atualizar os dados de um utilizador
routes.patch('/users', async (req, res) => {
    const { oldUsername, newUsername, newEmail, newPassword, newPhone } = req.body;
    try {
        const newUser = { username: newUsername, email: newEmail, password: newPassword, phone: newPhone };
        const oldUser = Users.checkUser(oldUsername);
        const updateUser = Users.updateUser(oldUser, newUser);

        res.status(200).send(updateUser);
    } catch {
        res.status(400).send(`Não foi possivel atualizar o utilizador com o username: ${username}, para o novo user: ${newUser}.`);
    }
})

// Apagar um utilizador através do username
routes.delete('/users/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const deletedUser = await Users.deleteUser(username);

        console.log(deletedUser)
        if (deletedUser == null)
            return res.status(404).end()


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
    } catch(err) {
        res.status(400).send(`Não foi possivel apagar os utilizadores. ${err.message}`);
    }
})

// Login de Utilizadores
routes.post('/login', async (req, res) => {
    const { username, password } = req.body;
    var gotUser;
    try {
        gotUser = await Users.checkUser(username);
    } catch {
        res.status(500).send("Error! Something went wrong.");
    }

    if (gotUser) {
        gotUser = gotUser[0]

        if (gotUser.password == password) {
            let token
            try {
                token = jwt.sign(
                    {
                        username: username,
                        password: gotUser.password
                    },
                    "prgserver",
                    { expiresIn: "1h" }
                )
                res.cookie('SessionToken', token)
                res.status(200).send('Login feito com sucesso');
            } catch (err) {
                res.status(500).send(err.message);
            }

        } else {
            res.status(400).send("Incorrect Password.");
        }
    } else {
        res.status(404).send("Username not Found.");
    }
})

module.exports = routes;