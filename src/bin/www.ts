#!/usr/bin/env node

import http from 'http';
import debugLib from 'debug';
import app from '../app';

const debug = debugLib('healthscope:server');

/**
 * Get port from the environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create an HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val: string) {
  const portNum = parseInt(val, 10);
  if (Number.isNaN(portNum)) {
    return val; // named pipe
  }
  if (portNum >= 0) {
    return portNum; // port number
  }
  return false;
}

function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr?.port ?? '');
  debug('Listening on ' + bind);
}
