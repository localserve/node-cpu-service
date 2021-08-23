"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hash_1 = require("./lib/hash");
var colors_1 = require("./lib/colors");
var cpu_info_node_lib_1 = require("@f0c1s/cpu.info.node.lib");
var log_1 = __importDefault(require("./lib/log"));
var path_1 = require("path");
var fs_1 = require("fs");
var node_common_log_lib_1 = require("@f0c1s/node-common-log-lib");
var TAGS = require('./lib/messages').TAGS;
var server = require('express')();
var bodyParser = require('body-parser');
var helmet = require('helmet');
var requestID = require('@m1yh3m/requestid.middleware')().requestid;
server.use(bodyParser.urlencoded({ extended: false }));
server.use(helmet());
server.use(requestID);
var configFilename = path_1.join(__dirname, '../config.json');
var config = JSON.parse(fs_1.readFileSync(configFilename).toString());
log_1.default(colors_1.green(TAGS.READ('FILE')), colors_1.yellow(configFilename));
/* All routes go through these */
var path = '/cpu_info';
var allowedPath = [path];
server.all('*', requestID);
server.all('*', function (req, res, next) {
    var _path = req.path;
    log_1.default(TAGS.REQUEST, colors_1.red(_path) + " at " + colors_1.yellow(Date.now()));
    if (!allowedPath.includes(_path)) {
        log_1.default(TAGS.INFO, 'Not allowed.', node_common_log_lib_1.TypesEnum.WARN);
        res.status(404).send('Not allowed. Send request to cpu_info.');
    }
    else {
        next();
    }
});
server.get(path, function (_, res) {
    var info = cpu_info_node_lib_1.cpuInfo();
    var cpu_info = JSON.stringify(info);
    var ts = Date.now();
    var hash = hash_1.sha256(cpu_info);
    res.json({ hash: hash, cpu_info: cpu_info, ts: ts });
});
/* SERVER IS READY */
var port = config.ports.services.cpu_info;
log_1.default(TAGS.INFO, "Serving cpu_info service at port " + port + " path " + path + ".");
server.listen(port);
//# sourceMappingURL=service.js.map