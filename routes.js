const config = require('./config.json');
const engineAppId = config.engineAppId;
const engineHost = config.engineHost;
const enginePort = config.enginePort;
const userDirectory = config.userDirectory;
const userId = config.userId;
const certificatesPath = config.certificatesPath;
const appExporterFolder = config.appExporterFolder;
const qlikShareFolder = config.qlikShareFolder;
const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const schema = require('enigma.js/schemas/12.20.0.json');
const promise = require('promise');
var findInFiles = require('find-in-files');
var zipFolder = require('zip-folder');
var qrsInteract = require('qrs-interact');
var session;
var qrsInstance = {
    hostname: engineHost,
    localCertPath: certificatesPath,
    repoAccount: 'UserDirectory=' + userDirectory + ';UserId=' + userId,
    repoAccountUserDirectory: userDirectory,
    repoAccountUserId: userId
};
var qrs = new qrsInteract(qrsInstance);

const readCert = filename => fs.readFileSync(path.resolve(__dirname, certificatesPath, filename));

// Enigma session config
function newSession() {
    session = enigma.create({
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
}


exports.getAppList = async function (req, res) {
    try {
        await newSession();
        global = await session.open();
        list = await global.getDocList();
        var apps = [];
        for (var i = 0, len = list.length; i < len; i++) {
            apps.push({ appName: list[i].qTitle, appId: list[i].qDocId });
        }
        await session.close();
        res.send(apps);
    }
    catch (err) {
        console.log(err);
    }
}



exports.getExtensions = async function (req, res) {
    try {
        await newSession();
        global = await session.open();
        app = await global.openDoc(req.query.appId);
        console.log('app', app);
        list = await app.getAllInfos();
        console.log(list);
        await session.close();
        res.send(list);
    }
    catch (err) {
        console.log(err);
    }
}

exports.findExtensions = async function (req, res) {
    results = await findInFiles.find("jarvis", 'C:/qlikshare/StaticContent/Extensions', '.qext');
    for (var result in results) {
        var res = results[result];
        console.log(
            'found "' + res.matches[0] + '" ' + res.count
            + ' times in "' + result + '"'
        );
    }
}

exports.zipExtension = function (req, res) {
    var status = '';
    if (!fs.existsSync(appExporterFolder + '/AppExporter')) {
        fs.mkdir(appExporterFolder + '/AppExporter');
    }
    if (fs.existsSync(qlikShareFolder + '/StaticContent/Extensions/' + req.query.extName)) {
        if (!fs.existsSync(appExporterFolder + '/AppExporter/' + req.query.appName)) {
            fs.mkdir(appExporterFolder + '/AppExporter/' + req.query.appName);
        }
        zipFolder(qlikShareFolder + '/StaticContent/Extensions/' + req.query.extName, appExporterFolder + '/AppExporter/' + req.query.appName + '/' + req.query.extName + '.zip', function (err) {
            if (err) {
                if(req.query.last = 1) {
                    fs.createReadStream(qlikShareFolder + '/Apps/' + req.query.appId).pipe(fs.createWriteStream(appExporterFolder + '/AppExporter/' + req.query.appName + '/' + req.query.appName + '.qvf'));
                    res.send([{"name": req.query.extName, "type": "ext", "status": err},{"name": req.query.appName, "type": "app", "status": 'COMPLETE'}])
                }
                else {
                    res.send({ "name": req.query.extName, "type": "ext", "status": err})
                }
            } else {
                if(req.query.last = 1) {
                    fs.createReadStream(qlikShareFolder + '/Apps/' + req.query.appId).pipe(fs.createWriteStream(appExporterFolder + '/AppExporter/' + req.query.appName + '/' + req.query.appName + '.qvf'));
                    res.send([{"name": req.query.extName, "type": "ext", "status": 'COMPLETE'},{"name": req.query.appName, "type": "app", "status": 'COMPLETE'}])
                }
                else {
                    res.send({ "name": req.query.extName, "type": "ext", "status": 'COMPLETE'})
                }
            }
        });
    }
    else {
        if(req.query.last = 1) {
            fs.createReadStream(qlikShareFolder + '/Apps/' + req.query.appId).pipe(fs.createWriteStream(appExporterFolder + '/AppExporter/' + req.query.appName + '/' + req.query.appName + '.qvf'));
            res.send([{"name": req.query.extName, "type": "ext", "status": 'EXTENSION NOT FOUND'},{"name": req.query.appName, "type": "app", "status": 'COMPLETE'}])
        }
        else {
            res.send({ "name": req.query.extName, "type": "ext", "status": 'EXTENSION NOT FOUND'})
        }
    }
}



exports.importApp = function (req, res) {
    var appFolder = req.query.appFolder;
    var stream = fs.createReadStream(appFolder);
    if (req.query.type == "ext") {
        qrs.Post('/extension/upload', stream, 'vnd.qlik.sense.app').then(function (result) {
            console.log(result);
            if(result.statusCode == 201) {
                res.send({"name": result.body.name, "type": "ext", "status": "COMPLETE"});
            }
        })
    }
    else if(req.query.type == "app") {
        qrs.Post('app/upload?name=' + req.query.appName,stream,'application/vnd.qlik.sense.app').then(function (result) {
            console.log(result);
            if(result.statusCode == 201) {
                res.send({"name": result.body.name, "type": "app", "status": "COMPLETE"});
            }
        });
    }
}