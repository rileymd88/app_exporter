const engineAppId = 'engineData';
const engineHost = 'DEDUS-CKH.qliktech.com';
const enginePort = 4747;
const userDirectory = 'QTSEL';
const userId = 'CKG';
const certificatesPath = './cert';
const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const schema = require('enigma.js/schemas/12.20.0.json');
const promise = require('promise');
var global;
var findInFiles = require('find-in-files');
var zipFolder = require('zip-folder');
var app;

const readCert = filename => fs.readFileSync(path.resolve(__dirname, certificatesPath, filename));

// Enigma session config
const session = enigma.create({
    schema,
    url: `wss://${engineHost}:${enginePort}/app/${engineAppId}`,
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




exports.getSession = function (req, res) {
    session.open().then((globalSession) => {
        console.log('Session was opened successfully');
        global = globalSession;
        res.send('global');
    }).catch((error) => {
        console.log('Failed to open session and/or retrieve the app list:', error);
        res.send(error);
    });
}


exports.getAppList = function (req, res) {
        global.getDocList().then((list) => {
            var apps = [];
            for (var i = 0, len = list.length; i < len; i++) {
                apps.push({ appName: list[i].qTitle, appId: list[i].qDocId });
            }
            res.send(apps);
        });
}

exports.getExtensions = function (req, res) {
        global.openDoc(req.query.appId).then((a) => {
            app = a;
            console.log('app', app);
            app.getAllInfos().then(function (list) {
                console.log(list);
                res.send(list);
            }).catch((err)=>{
                console.log(err);
            })
        }).catch((err)=>{
            console.log(err);
        })
}

exports.findExtensions = function (req, res) {
    var findInFiles = require("find-in-files")
    findInFiles.find("jarvis", 'C:/qlikshare/StaticContent/Extensions', '.qext')
        .then(function (results) {
            for (var result in results) {
                var res = results[result];
                console.log(
                    'found "' + res.matches[0] + '" ' + res.count
                    + ' times in "' + result + '"'
                );
            }
        });
}

exports.zipExtension = function (req, res) {
    if (!fs.existsSync('C:/AppExporter')) {
        fs.mkdir('C:/AppExporter');
    }
    if (fs.existsSync('C:/qlikshare/StaticContent/Extensions/' + req.query.extName)) {
        if (!fs.existsSync('C:/AppExporter/' + req.query.appName)) {
            fs.mkdir('C:/AppExporter/' + req.query.appName);
        }
        zipFolder('C:/qlikshare/StaticContent/Extensions/' + req.query.extName, 'C:/AppExporter/' + req.query.appName + '/' + req.query.extName + '.zip', function (err) {
            if (err) {
                res.send({ "extName": req.query.extName, "status": err })
                console.log('ERROR', err);
            } else {
                res.send({ "extName": req.query.extName, "status": 'COMPLETE' })
                console.log('COMPLETE');
            }
        });
    }
    else {
        res.send({ "extName": req.query.extName, "status": 'EXT NOT FOUND' })
    }
    fs.createReadStream('C:/qlikshare/Apps/' + req.query.appId).pipe(fs.createWriteStream('C:/AppExporter/' + req.query.appName + '/' + req.query.appName + '.qvf'));
}