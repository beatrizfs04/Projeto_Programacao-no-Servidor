/* Requirements */
const express = require('express');
const app = express();
const port = 3000;
const pageTitle = "Projeto Final - Programação no Servidor";

/* Imports */
const Routes = require('./Controllers/routes');
const Files = require('./Controllers/files');
const Users = require('./Controllers/users');

Users.checkUsers()

/* Initialize */

app.use(express.json());
app.use('/', Routes);

app.listen(port, () => {
    console.log(`Web Page Title: ${pageTitle} | On: http://localhost:${port}`);
});