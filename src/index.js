#!/usr/bin/env babel-node

import { Server as WSS } from 'ws';
import openTerm from './utils/openTermWithScript';

console.log('Going up');

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

const cxs = [];

const handler = (message) => {
  const msg = JSON.parse(decodeURIComponent(message));
  console.log(msg);
  if (isCustomMsg(msg)) {
    const { data, action } = msg;
    console.log(`Received task ${action}`);
    openTerm(action, data);
  }
  const errors = [];
  cxs.forEach((cx, i) => {
    try {
      return cx.send(msg);
    } catch (err) {
      return errors.push(i);
    }
  });
  const results = [];
  for (let ii = errors.length - 1; ii >= 0; ii -= 1) {
    const i = errors[ii];
    results.push(cxs.splice(i, 1));
  }
  return results;
};

const config = {
  port: '7442',
  host: 'localhost'
};

const wss = new WSS(config);


wss.on('connection', (ws) => {
  cxs.push(ws);
  return ws.on('message', handler);
});
