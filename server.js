

var https = require('https');
var express=require('express');
var fs=require('fs');
var routes = require('./routes');

var app = express();

app.use(express.static(__dirname));
app.use('/getAppList', routes.getAppList);
app.use('/getExtensions', routes.getExtensions);
app.use('/findExtensions', routes.findExtensions);
app.use('/zipExtension', routes.zipExtension);

var sslOptions = {
    key: fs.readFileSync('./cert/server_key.pem'),
    cert: fs.readFileSync('./cert/server.pem')
}    


var server = https.createServer(sslOptions, app).listen(8081);
console.log('server running on port: ' + 8081);