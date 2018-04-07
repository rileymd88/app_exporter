const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const schema = require('enigma.js/schemas/12.20.0.json');

const appId = 'engineData';
const engineHost = 'DEDUS-CKH.qliktech.com';
const enginePort = 4747;
const userDirectory = 'QTSEL';
const userId = 'CKG';
const certificatesPath = './cert';

const readCert = filename => fs.readFileSync(path.resolve(__dirname, certificatesPath, filename));

const session = enigma.create({
    schema,
    url: `wss://${engineHost}:${enginePort}/app/${appId}`,
    // Notice the non-standard second parameter here, this is how you pass in
    // additional configuration to the 'ws' npm library, if you use a different
    // library you may configure this differently:
    createSocket: url => new WebSocket(url, {
        ca: [readCert('root.pem')],
        key: readCert('client_key.pem'),
        cert: readCert('client.pem'),
        headers: {
            'X-Qlik-User': `UserDirectory=${encodeURIComponent(userDirectory)}; UserId=${encodeURIComponent(userId)}`,
        },
    }),
});

exports.openSession = session.open().then((globalSession) => {
    console.log('Session was opened successfully');
    return globalSession;
}).catch((error) => {
    console.log('Failed to open session and/or retrieve the app list:', error);
    return;
});



