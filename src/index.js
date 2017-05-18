import isDocker from 'is-docker';
import express from 'express';
import { Server as WSS } from 'ws';
import openTerm from 'cmdToNewTab';

const echo = console.log;
const echod = console.dir;

const HOSTNAME = isDocker() ? '0.0.0.0' : 'localhost';
const WS_PORT = process.env.APPPORT || 7442;
const CMD_PORT = 3009;

echo('Going up');

const isCustomMsg = ({ data = null }) => {
  if (data === null) {
    return false;
  } else if (Array.isArray(data) && data.length > 0) {
    return true;
  } else if (Object.keys(data).length > 0) {
    return true;
  }
  return false;
};

const makeServer = cmdSender => {
  const app = express();
  app.get('/jarvix/:cmd', (req, res) => {
    const { cmd } = req.params;
    const options = req.query;
    cmdSender(cmd, options);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(`Got ${cmd}`));
  });
  return app;
};

const makeHandler = ws => (cmd, options) => {
  switch (cmd.type) {
    case 'wildcard': {
      const { action } = cmd;
      ws.send({ action, opts: options });
      break;
    }
    default:
      throw new Error(`Unrecognized command type "${cmd.type}"`);
  }
};

const config = {
  port: WS_PORT,
  host: HOSTNAME
};

const wss = new WSS(config);

wss.on('connection', ws => {
  echo('NewConnection');
  makeServer(makeHandler(ws)).listen(CMD_PORT);
  ws.on('message', message => {
    const msg = JSON.parse(decodeURIComponent(message));
    echod(msg);
    if (isCustomMsg(msg)) {
      const { data, action } = msg;
      openTerm(action, data);
    }
  });
});
