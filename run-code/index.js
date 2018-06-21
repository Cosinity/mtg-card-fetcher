'use strict';

// Imports dependencies and set up http server

var express = require('express');
var bodyParser = require('body-parser');
var msgHandler = require('./message-handler');

var app = express().use(bodyParser.json()); // creates express http server

var VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, function () {
  return console.log('webhook is listening');
});

// Creates the endpoint for our webhook 
app.post('/webhook', function (req, res) {

  var body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the body of the webhook event
      var webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      var sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        msgHandler.handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        msgHandler.handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook
app.get('/webhook', function (req, res) {

  // Parse the query params
  var mode = req.query['hub.mode'];
  var token = req.query['hub.verify_token'];
  var challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});