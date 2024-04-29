const express = require('express');
const app = express();
const port = 3000;
const pageTitle = "Projeto Final - Programação no Servidor"
const fs = require('fs');

function loadFile(fileDict) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileDict, 'utf8', (err, contents) => {
            if (err != null) { reject(err); return; }
            console.log("> File Readed Successfully.");
            resolve(JSON.parse(contents));
        });
    });
}

function saveFile(fileDict, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileDict, JSON.stringify(data), (err) => {
            if (err != null) { reject(err); return; }
            console.log("> Successfully Written to File.")
            resolve(JSON.parse(JSON.stringify(data)));
        });
    });
}