/* Requirements */
const express = require('express');
const routes = express.Router();
const jwt = require("jsonwebtoken");
const SQL = require('../Controllers/sql');
const bcrypt = require('bcrypt');
const Users = require('../Controllers/users');

/* Import das Funções */
const Montagens = require('../Controllers/montagens');
const Drones = require('../Controllers/drones');
const Pecas = require('../Controllers/pecas');


// ----------------------- Users ----------------------- //

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
routes.get('/users/:username', async (req, res) => {
    const {username} = req.params;
    try {
        const gotUser = await Users.checkUser(username);
        console.log(username)
        console.log(gotUser)
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
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username: username, email: email, password: hashedPassword, phone: phone };
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
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const newUser = { username: newUsername, email: newEmail, password: hashedPassword, phone: newPhone };
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
        const loggedIn = users.loginUser(gotUser, password);
        if (loggedIn) {
            res.status(200).send('Login feito com sucesso');
        } else {
            res.status(400).send("Incorrect Password.");
        }
    } else {
        res.status(404).send("Username not Found.");
    }
})


// ----------------------- Drones ----------------------- //

// Ver todos os drones
routes.get('/drones', async (req, res) => {
    try {
        const gotDrones = await Drones.checkDrones();
        res.status(200).send(gotDrones);
    } catch {
        res.status(400).send(`Não foi possivel aceder à informação da DronesDB.`);
    }
})

// Ver um drone através do modelo
routes.get('/drones/:droneModelo', async (req, res) => {
    const { droneModelo } = req.params;
    try {
        const gotDrone = await Drones.checkDrone(droneModelo);
        console.log(droneModelo)
        console.log(gotDrone)
        res.status(200).send(gotDrone);
    } catch {
        res.status(400).send(`Não foi possivel encontrar o drone com o modelo: ${droneModelo}.`);
    }
})

// Criar um drone
routes.post('/drones', async (req, res) => {
    const { droneModelo, pecasDrone } = req.body;
    try {
        const existDrone = await Drones.checkDrone(droneModelo);
        if (existDrone.length > 0)
            return res.status(400).send(`Já existe um drone com o modelo: ${droneModelo}`);

        const newDrone = { droneModelo: droneModelo, pecasDrone: pecasDrone };
        const createdDrone = await Drones.createDrone(newDrone);
        return res.status(200).send(createdDrone);

    } catch (err) {
        res.status(400).send(`${err.message}`);
    }
})

// Atualizar os dados de um drone
routes.patch('/drones', async (req, res) => {
    const { oldDroneModelo, newDroneModelo, newPecasDrone } = req.body;
    try {
        const newDrone = { droneModelo: newDroneModelo, pecasDrone: newPecasDrone };
        const oldDrone = Drones.checkDrone(oldDroneModelo);
        const updatedDrone = Drones.updateDrone(oldDrone, newDrone);

        res.status(200).send(updatedDrone);
    } catch {
        res.status(400).send(`Não foi possivel atualizar o drone com o modelo: ${oldDroneModelo}, para o novo modelo: ${newDroneModelo}.`);
    }
})

// Apagar um drone através do modelo
routes.delete('/drones/:droneModelo', async (req, res) => {
    const { droneModelo } = req.params;
    try {
        const deletedDrone = await Drones.deleteDrone(droneModelo);

        console.log(deletedDrone)
        if (deletedDrone == null)
            return res.status(404).end()


        res.status(200).send(deletedDrone);
    } catch {
        res.status(400).send(`Não foi possivel apagar o drone com o modelo: ${droneModelo}.`);
    }
})

// Apagar todos os drones
routes.delete('/drones', async (req, res) => {
    try {
        const deletedDrones = Drones.deleteDrones();
        res.status(200).send(deletedDrones);
    } catch(err) {
        res.status(400).send(`Não foi possivel apagar os drones. ${err.message}`);
    }
})

// ----------------------- Peças ----------------------- //
//Ver todas as pecas
routes.get('/pecas', async (req, res) => {
    try {
        const gotPecas = await Pecas.checkPecas();
        res.status(200).send(gotPecas);
    } catch {
        res.status(400).send(`Não foi possível acessar informações da PecasDB.`);
    }
})

//ver uma peca através do nome
routes.get('/pecas/:nomePeca', async (req, res) => {
    const { nomePeca } = req.params;
    try {
        const gotPeca = await Pecas.checkPeca(nomePeca);
        res.status(200).send(gotPeca);
    } catch {
        res.status(400).send(`Não foi possível encontrar a peça com o nome: ${nomePeca}.`);
    }
})

//adicionar uma peca
routes.post('/pecas', async (req, res) => {
    const { nomePeca, quantidade } = req.body;
    try {
        const existPeca = await Pecas.checkPeca(nomePeca);

        if (existPeca.length > 0)
            return res.status(400).send(`Já existe uma peça com o nome: ${nomePeca}`);
        
        const newPecaData = { nomePeca: nomePeca, quantidade: quantidade };
        const createdPeca = await Pecas.createPeca(newPecaData);
        return res.status(200).send(createdPeca);

    } catch (err) {
        res.status(400).send(`${err.message}`);
    }
})

//atualizar uma peca
routes.patch('/pecas', async (req, res) => {
    const { oldNomePeca, newNomePeca, newQuantidade } = req.body;
    try {
        const oldPeca = Pecas.checkPeca(oldNomePeca);
        const newPecaData = { nomePeca: newNomePeca, quantidade: newQuantidade };
        const updatedPeca = Pecas.updatePeca(oldPeca, newPecaData);

        res.status(200).send(updatedPeca);
    } catch {
        res.status(400).send(`Não foi possível atualizar a peça com o nome: ${oldNomePeca}.`);
    }
})

//apagar uma peca pelo nome
routes.delete('/pecas/:nomePeca', async (req, res) => {
    const { nomePeca } = req.params;
    try {
        const deletedPeca = await Pecas.deletePeca(nomePeca);

        console.log(deletedPeca)
        if (deletedPeca == null)
            return res.status(404).end()


        res.status(200).send(deletedPeca);
    } catch {
        res.status(400).send(`Não foi possível apagar a peça com o nome: ${nomePeca}.`);
    }
})

//apagar todas as pecas
routes.delete('/pecas', async (req, res) => {
    try {
        const deletedPecas = await Pecas.deletePecas();
        res.status(200).send(deletedPecas);
    } catch(err) {
        res.status(400).send(`Não foi possível apagar as peças. ${err.message}`);
    }
})

// ----------------------- Peças ----------------------- //
/* Fazer com que ao criar uma montagem, verificar a quantidade de peças em stock no pecas.js para a quantidade de peças precisas
No caso de não ter peças suficientes para criar uma montagem, avisar e negar a dizer que não tem peças suficientes no stock */

module.exports = routes;