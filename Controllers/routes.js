/* Requirements */
const express = require('express');
const routes = express.Router();
const SQL = require('../Controllers/sql');
const bcrypt = require('bcrypt');
const Users = require('../Controllers/users');
var { isAuthorized } = require('./auth');

/* Import das Funções */
const Montagens = require('../Controllers/montagens');
const Drones = require('../Controllers/drones');
const Pecas = require('../Controllers/pecas');


// ----------------------- Users ----------------------- //

// Ver todos os utilizadores
routes.get('/users', isAuthorized, async (req, res) => {
    try {
        const users = await Users.getAllUsers();
        if (users) {
            return res.status(200).send(users);
        } else {
            return res.status(204).send({ message: "No users in system" })
        }
    } catch (err) {
        res.status(err.status ?? 500).send(`Error: ${err.message}`);
    }
})

// Ver um utilizador através do username
routes.get('/users/:username', isAuthorized, async (req, res) => {
    const { username } = req.params;
    try {
        const user = await Users.getUserByUsername(username);

        if (!user) return res.status(404).send({ message: `No user found with username of ${username}` });

    } catch (err) {
        res.status(err.status ?? 500).send(`Error: ${err.message}.`);
    }
})

// Criar um utilizador
routes.post('/users', async (req, res) => {
    const { username, email, password, phone } = req.body;
    try {
        const existUser = await Users.getUserByUsername(username);

        if (existUser)
            return res.status(404).send(`The username ${username} is already taken`);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username: username, email: email, password: hashedPassword, phone: phone };
        const createdUser = await Users.createUser(newUser);
        return res.status(200).send(createdUser);

    } catch (err) {
        res.status(err.status ?? 500).send(`Error: ${err.message}`);
    }
})

// Atualizar os dados de um utilizador
routes.patch('/users', isAuthorized, async (req, res) => {
    const { userId, userData } = req.body;
    const { username, email, password, phone } = userData;


    try {
        if (!userId)
            return res.status(400).send('Missing userId of user to update');

        
        const oldUserData = await Users.getUserById(userId);
        if(!oldUserData) return res.status(404).send({message: `No user found with id of ${userId}`})


        const hashedPassword = await bcrypt.hash(password, 10);

        
        const updatedUserData = {
            username: username ?? oldUserData.username,
            email: email ?? oldUserData.email,
            password: hashedPassword ?? oldUserData.password,
            phone: phone ?? oldUserData.phone
        };
        
        const updatedUser = await Users.updateUser(oldUserData, updatedUserData, {new: true});

        res.status(200).send(updatedUser);
    } catch (err) {
        res.status(err.status ?? 500).send(`Error: ${err.message}`);
    }
})

// Apagar um utilizador através do username
routes.delete('/users/:username', isAuthorized, async (req, res) => {
    const { username } = req.params;
    try {
        const deletedUser = await Users.deleteUser(username);

        console.log(deletedUser)
        if (deletedUser == null)
            return res.status(404).end()


        res.status(200).send(deletedUser);
    } catch (err) {
        res.status(err.status ?? 500).send(`Error: ${err.message}.`);
    }
})

// Apagar um utilizador através do id
routes.delete('/users/:userId', isAuthorized, async (req, res) => {
    const { userId } = req.params;
    try {
        const deletedUser = await Users.deleteUserById(userId);

        if (!Boolean(deletedUser))
            return res.status(404).send({ message: `No user found with id of ${userId}` })


        return res.status(200).send(deletedUser);
    } catch (err) {
        res.status(err.status ?? 500).send(`Error: ${err.message}.`);
    }
})

// Apagar todos os utilizadores
routes.delete('/users', isAuthorized, async (req, res) => {
    try {
        const deletedUsers = Users.deleteAllUsers();
        res.status(200).send(deletedUsers);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
})

// Login de Utilizadores
routes.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Users.getUserByUsername(username);

        if (user) {
            const cookie = await Users.loginUser(username, password);
            
            if (cookie) {
                res.cookie('Authentication', cookie)
                return res.status(200).send('Credenciais Aprovadas!');
            } else {
                return res.status(401).send("Credenciais Incorretas.");
            }
        } else {
            return res.status(401).send("Credenciais Incorretas.");
        }

    } catch (err) {
        return res.status(err.status ?? 500).send(`Error: ${err.message}`);
    }

})


// ----------------------- Drones ----------------------- //

// Ver todos os drones
routes.get('/drones', isAuthorized, async (req, res) => {
    try {
        const drones = await Drones.getAllDrones();
        if (drones) {
            return res.status(200).send(drones);
        } else {
            return res.status(204).send({ message: "Não há drones no sistema" })
        }
    } catch {
        res.status(err.status ?? 500).send(`Error: ${err.message}`);
    }
})

// Ver um drone através do modelo
routes.get('/drones/:droneModelo', isAuthorized, async (req, res) => {
    const { droneId } = req.params;
    try {
        const drone = await Drones.getDroneById(droneId);
        if (drone) {
            return res.status(200).send(drone);
        } else {
            return res.status(404).send({ message: `No drone found with id of ${droneId}` })
        }
    } catch (err) {
        res.status(err.status ?? 500).send(`Error: ${err.message}`);
    }
})

// Criar um drone
routes.post('/drones', isAuthorized, async (req, res) => {
    const { droneModelo, pecasDrone } = req.body;
    try {

        const newDrone = { droneModelo: droneModelo, pecasDrone: pecasDrone };
        const createdDrone = await Drones.createDrone(newDrone);
        return res.status(200).send(createdDrone);

    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
})

// Atualizar os dados de um drone
routes.patch('/drones', isAuthorized, async (req, res) => {
    const { oldDroneModelo, newDroneModelo, newPecasDrone } = req.body;
    try {
        const newDrone = { droneModelo: newDroneModelo, pecasDrone: newPecasDrone };
        const oldDrone = await Drones.checkDrone(oldDroneModelo);
        const updatedDrone = await Drones.updateDrone(oldDrone, newDrone);

        res.status(200).send(updatedDrone);
    } catch {
        res.status(err.status ?? 500).send(`Não foi possivel atualizar o drone com o modelo: ${oldDroneModelo}, para o novo modelo: ${newDroneModelo}.`);
    }
})

// Apagar um drone através do id
routes.delete('/drones/:droneId', isAuthorized, async (req, res) => {
    const { droneId } = req.params;
    try {
        const deletedDrone = await Drones.deleteDroneById(droneId);

        if (!Boolean(deletedDrone))
            return res.status(404).send({ message: `No drone found with id of ${droneId}` })

        res.status(200).send(deletedDrone);

    } catch {
        res.status(err.status ?? 500).send(`Não foi possivel apagar o drone com o modelo: ${droneModelo}.`);
    }
})

// Apagar todos os drones
routes.delete('/drones', isAuthorized, async (req, res) => {
    try {
        const deletedDrones = Drones.deleteAllDrones();
        res.status(200).send(deletedDrones);
    } catch (err) {
        res.status(400).send(`Erro: ${err.message}`);
    }
})

// ----------------------- Peças ----------------------- //
//Ver todas as pecas
routes.get('/pecas', isAuthorized, async (req, res) => {
    try {
        const pecas = await Pecas.getAllPecas();
        if (pecas) {
            return res.status(200).send(pecas);
        } else {
            return res.status(204).send({ message: 'No pecas' })
        }
    } catch (err) {
        res.status(500).send(`Erro: ${err.message}`);
    }
})

//ver uma peca através do nome
routes.get('/pecas/:pecaId', isAuthorized, async (req, res) => {
    const { pecaId } = req.params;
    try {
        const gotPeca = await Pecas.getPecaById(pecaId);
        if (!gotPeca)
            return res.status(404).send("Nenhuma peça encontrada")

        res.status(200).send(gotPeca);
    } catch (err) {
        res.status(err.status ?? 500).send(`Não foi possível encontrar a peça com o ID: ${pecaId}.\n Erro: ${err.message}`);
    }
})

//adicionar uma peca
routes.post('/pecas', isAuthorized, async (req, res) => {
    const { nomePeca, quantidade } = req.body;
    try {
        const newPecaData = { nomePeca: nomePeca, quantidade: quantidade };
        const createdPeca = await Pecas.createPeca(newPecaData);
        res.status(200).send(createdPeca);
    } catch (err) {
        return res.status(err.status ?? 500);
    }
})

//atualizar uma peca
routes.patch('/pecas', isAuthorized, async (req, res) => {
    const { pecaId, newPeca } = req.body;
    try {
        const oldPeca = await Pecas.getPecaById(pecaId);
        if (!oldPeca)
            return res.status(404).send(`Não existe uma peça com oid ${pecaId}`)

        const updatedPecaData = {
            nomePeca:
                newPeca.nomePeca ?? oldPeca.nomePeca,
            quantidade: newPeca.quantidade ?? oldPeca.quantidade
        };

        const updatedPeca = await Pecas.updatePecaById(oldPeca, updatedPecaData);

        res.status(200).send(updatedPeca);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
})

//apagar uma peca pelo nome
routes.delete('/pecas/:pecaId', isAuthorized, async (req, res) => {
    const { pecaId } = req.params;
    try {
        const deletedPeca = await Pecas.deletePecaById(pecaId);

        if (!Boolean(deletedPeca))
            return res.status(404).send(`A peça ${nomePeca} não existe !`)


        res.status(200).send(deletedPeca);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
})

//apagar todas as pecas
routes.delete('/pecas', isAuthorized, async (req, res) => {
    try {
        const deletedPecas = await Pecas.deleteAllPecas();
        res.status(200).send(deletedPecas);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
})

// ----------------------- Montagens ----------------------- //

routes.get('/montagens', isAuthorized, async (req, res) => {
    try {
        const montagensList = await Montagens.getAllMontagens();
        res.status(200).json(montagensList);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ${err.message}`);
    }
});

routes.get('/montagem/:montagemId', isAuthorized, async (req, res) => {
    const { montagemId } = req.params;
    try {
        const montagem = await Montagens.getMontagemById(droneModel, workerName, startDate);
        if (!montagem) {
            return res.status(404).send('Montagem não encontrada');
        }
        res.status(200).json(montagem);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
});

routes.put('/montagem/:montagemId', isAuthorized, async (req, res) => {
    const { montagemId } = req.params;
    const newMontagem = { droneModel: req.body.droneModel, workerName: req.body.workerName, finished: (req.body.finished ? req.body.finished : false), pecasUsadas: req.body.pecasUsadas }
    try {
        const updatedMontagem = await Montagens.updateMontagemById(montagemId, newMontagem, req.user);
        res.status(200).json(updatedMontagem);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
});

routes.post('/montagem', isAuthorized, async (req, res) => {
    const newMontagemData = req.body;
    try {
        const createdMontagem = await Montagens.createMontagem(newMontagemData, req.user);
        res.status(201).json(createdMontagem);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro: ${err.message}`);
    }
});


routes.delete('/montagem', isAuthorized, async (req, res) => {
    const montagemData = req.body;
    try {
        const deletedMontagem = await Montagens.deleteMontagemById(montagemData);
        res.status(200).json(deletedMontagem);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao apagar a montagem: ${err.message}`);
    }
});

routes.delete('/montagens', isAuthorized, async (req, res) => {
    try {
        const deletedMontagens = await Montagens.deleteAllMontagens();
        res.status(200).json(deletedMontagens);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao apagar todas as montagens: ${err.message}`);
    }
});

// ----------------------- Estatisticas ----------------------- //

routes.get('/estatisticas/tempoMontagem/:IdMontagem', isAuthorized, async (req, res) => {
    const { IdMontagem } = req.params;
    try {
        const timeMontagem = await Montagens.getTempoMontagem(IdMontagem);
        res.status(200).send(timeMontagem);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao obter o tempo de montagem: ${err.message}`);
    }
});

routes.get('/estatisticas/PecasUtilizacao', isAuthorized, async (req, res) => {
    try {
        const listaPecas = await Montagens.getPecasUtilizacao();
        res.status(200).send(listaPecas);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao procurar a vezes que as peças foram usadas: ${err.message}`);
    }
});

routes.get('/estatisticas/PecaMaisUtilizada', isAuthorized, async (req, res) => {
    try {
        const pecaMaisUtilizada = await Montagens.getPecaMaisUtilizada();
        res.status(200).send(pecaMaisUtilizada);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao procurar a peça mais usada: ${err.message}`);
    }
});

routes.get('/estatisticas/PecaMenosUtilizada', isAuthorized, async (req, res) => {
    try {
        const PecaMenosUtilizada = await Montagens.getPecaMenosUtilizada();
        res.status(200).send(PecaMenosUtilizada);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao procurar a peça menos usada: ${err.message}`);
    }
});

routes.get('/estatisticas/topUsers', isAuthorized, async (req, res) => {
    try {
        const topUsers = await Montagens.getUserMaisProduziu();
        res.status(200).send(topUsers);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao procurar os users que mais produziram drones: ${err.message}`);
    }
});

routes.get('/estatisticas/bottomUsers', isAuthorized, async (req, res) => {
    try {
        const bottomUsers = await Montagens.getUserMenosProduziu();
        res.status(200).send(bottomUsers);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao procurar os users que menos produziram drones: ${err.message}`);
    }
});

routes.get('/estatisticas/workerMontagens/:workerName', isAuthorized, async (req, res) => {
    const { workerName } = req.params;
    try {
        const montagensWorker = await Montagens.getMontagensTrabalhador(workerName);
        res.status(200).send(montagensWorker);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao procurar os users que menos produziram drones: ${err.message}`);
    }
});

routes.get('/estatisticas/workersMontagens/', isAuthorized, async (req, res) => {
    try {
        const montagensWorkers = await Montagens.getMontagensTrabalhadores();
        res.status(200).send(montagensWorkers);
    } catch (err) {
        res.status(err.status ?? 500).send(`Erro ao procurar os users que menos produziram drones: ${err.message}`);
    }
});

module.exports = routes;