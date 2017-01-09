#!/usr/bin/env babel-node
import { Server as WSS } from 'ws';
import openTerm from './utils/openTermWithScript';
import screenshotGrabber from './utils/download/screenShot';

const isCustomMsg = ({ data = null }) => {
  if (data === null) {
    return false
  } else if (Array.isArray(data) && data.length > 0) {
    return true
  } else if (Object.keys(data).length > 0) {
    return true
  }
  return false
}

const handler = (message) => {
  const msg = JSON.parse(decodeURIComponent(message))
  console.log(msg)
  if (isCustomMsg(msg)) {
      routeMsg(msg)
  }
  let errors = [];
  cxs.forEach( (cx, i) => {
    try {
      return cx.send(msg);
    } catch (err) {
      return errors.push(i);
    }
  });
  let results = [];
  for (let _i = errors.length - 1; _i >= 0; _i--) {
    let i = errors[_i]
    results.push(cxs.splice(i, 1));
  }
  return results;
};

const logMsg = (msg) => console.log(`Received task ${msg.action}`);

const handleCustom = (type, { data }) => openTerm(type, data);

const routeMsg = (msg) => {
  logMsg(msg);
  handleCustom(msg.action, msg);
};

const config = {
  port: '7442',
  host: 'localhost'
};

const wss = new WSS({
  port: config.port,
  host: config.host
});

let cxs = [];

wss.on('connection', (ws) => {
  cxs.push(ws);
  return ws.on('message', handler);
});
