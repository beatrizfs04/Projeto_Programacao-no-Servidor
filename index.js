/* Requirements */
const express = require('express');
const app = express();
const port = 3000;
const pageTitle = "Projeto Final - Programação no Servidor";

/* Imports */
const SQL = required('./Controllers/sql');
const Files = required('./Controllers/files');

/* Initialize */

app.use(express.json());
app.use('/', SQL);

app.listen(port, () => {
    console.log(`Web Page Title: ${pageTitle} | On: http://localhost:${port}`);
});