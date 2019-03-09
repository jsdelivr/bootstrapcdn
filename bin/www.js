'use strict';

const http = require('http');
const app = require('../app');
const { port } = require('../config').app;

app.set('port', process.env.PORT || port || 3000);

const server = http.createServer(app);

server.listen(app.get('port'), () => console.log(`Express server listening on port ${app.get('port')}`));

// vim: ft=javascript sw=4 sts=4 et:
