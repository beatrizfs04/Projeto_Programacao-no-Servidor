/* Requirements */
const express = require('express');
const fs = require('fs');

/* Functions */
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

module.exports = { loadFile, saveFile };