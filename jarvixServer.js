#!/usr/bin/env node
"use strict";

const openTerm = require('./utils/openTermWithScript.js')
const screenshotGrabber = require('./utils/downloadScreenShot.js')


const isCustomMsg = (msg) => {
  if (msg.data === undefined) return false

  if (Array.isArray(msg.data)) {
    if (msg.data.length > 0) {
      return true
    }
  } else {
    if (Object.keys(msg.data).length > 0) {
      return true
    }
  }
  return false
}

const handler = (message) => {
  const msg = JSON.parse(decodeURIComponent(message))

  console.log(msg)

  if (isCustomMsg(msg)) {
      handleCustom(msg)
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

const logMsg = (msg) => {
  console.log(`Received task ${msg.action}`)
}

const handleCustom = (msg) => {
  logMsg(msg)
  switch (msg.action) {
    case "reviewInfo":
      openTerm("reviewHandler", msg.data);
      break;

    case "testScreenshot":
      openTerm("screenshotHandler", msg.data);
      break;

    case "jenkinsScreenshot":
      openTerm("jenkinsHandler", msg.data);
      break;

  }
}

const config = {
  port: "7442",
  host: "localhost"
};

const WSS = require("ws").Server;

const wss = new WSS({
  port: config.port,
  host: config.host
});

let cxs = [];

wss.on("connection", (ws) => {
  cxs.push(ws);
  return ws.on("message", handler);
});
