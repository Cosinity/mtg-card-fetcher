const request = require('request');

const PAGE_ACCESS_TOKEN = 'EAACWivIS0UsBAIby98sVKffhuFmlJfl0K1vLYTPtzB5iwjOrUiDL9ZCrjlo6VVchBRgGblin2ZB1guS1f5BHinGIf8K88iEGC96hf1PbtmSo0dwxC9i8F6sX0Rs4fKKeFE6qaa2B3AzvKZCr3LXZAnxbWZBXYHiR3PJ9g7olkWgZDZD'


// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {
  
      // Parse the message to find any card names
      const regEx = /\[\[.*\]\]/g;
      const cardNamesArr = received_message.text.match(regEx);
      let cardNames = '';
      if (cardNamesArr) {
        cardNames = cardNamesArr[0];
        cardNames = cardNames.replace(/\[|\]/g, '').replace(' ', '+');
      }

      request({
        'uri': `https://api.scryfall.com/cards/named?fuzzy=${cardNames}`,
        'method': 'GET'
      }, (err, res, body) => {
        if (err) {
          console.log(err);
          return;
        }
        const card = JSON.parse(body);
        if (card.status === 404) {
          response = {
            text: `${card.details}`
          }
        } else {
          response = {
            text: `'Your card:'`,
            attachment: `${card.image_uris.normal}`
          };
        }
        // Sends the response message
        callSendAPI(sender_psid, response);
      });
    }
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

export {
    handleMessage,
    handlePostback,
    callSendAPI
}