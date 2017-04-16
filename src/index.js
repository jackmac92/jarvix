#!/usr/bin/env babel-node
import express from 'express';
import { Server as WSS } from 'ws';
import openTerm from './utils/openTermWithScript';

const echo = console.log;
const echod = console.dir;

const WS_PORT = process.env.APPPORT;
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
    res.send(JSON.stringify(response));
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
  host: '0.0.0.0'
};

const wss = new WSS(config);

wss.on('connection', ws => {
  makeServer(makeHandler(ws)).listen(CMD_PORT);
  ws.on('message', (message, flags) => {
    const msg = JSON.parse(decodeURIComponent(message));
    echod(msg);
    echod(flags);
    if (isCustomMsg(msg)) {
      const { data, action } = msg;
      openTerm(action, data);
    }
  });
});
