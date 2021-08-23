import {sha256} from './lib/hash';
import {Express} from "express";
import {green, red, yellow} from './lib/colors';
import {cpuInfo} from '@f0c1s/cpu.info.node.lib';
import log from './lib/log';
import {join} from 'path';
import {readFileSync} from 'fs';
import CONFIG from '../config';
import {TypesEnum} from '@f0c1s/node-common-log-lib';
import {easyCors} from '@f0c1s/easy-cors';

const {TAGS} = require('./lib/messages');

const server: Express = require('express')();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const requestID = require('@m1yh3m/requestid.middleware')().requestid;
server.use(bodyParser.urlencoded({extended: false}));
server.use(helmet());
server.use(requestID);
easyCors(server);

const configFilename = join(__dirname, '../config.json');
const config: CONFIG = JSON.parse(readFileSync(configFilename).toString());
log(green(TAGS.READ('FILE')), yellow(configFilename));

/* All routes go through these */
const path = '/cpu_info';
const allowedPath = [path];
server.all('*', requestID);
server.all('*', (req: { path: any }, res: any, next: () => void) => {
    const _path = req.path;
    log(TAGS.REQUEST, `${red(_path)} at ${yellow(Date.now())}`);
    if (!allowedPath.includes(_path)) {
        log(TAGS.INFO, 'Not allowed.', TypesEnum.WARN);
        res.status(404).send('Not allowed. Send request to cpu_info.');
    } else {
        next();
    }
});

server.get(path, (_, res) => {
    const info = cpuInfo();
    const cpu_info = JSON.stringify(info);
    const ts = Date.now();
    const hash = sha256(cpu_info);
    res.json({hash, cpu_info, ts});
});
/* SERVER IS READY */
const port = config.ports.services.cpu_info;
log(TAGS.INFO, `Serving cpu_info service at port ${port} path ${path}.`);
server.listen(port);
