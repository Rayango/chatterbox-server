/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');
var urlmodule = require('url');
var _ = require('underscore');
var storage = require('../data/messages.js');
var path = require('path');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var {headers, method, url} = request; 
  var urlObject = urlmodule.parse(url, true);
  //console.log('url Object', urlObject);
  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'text/plain';
  headers['Content-Type'] = 'application/JSON';

  request.on('error', function(err) {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });

  var staticEndpoints = {
    '/': 'text/html',
    '/styles/styles.css': 'text/css',
    '/images/spiffygif_46x46.gif': 'image/gif',
    '/scripts/app.js': 'text/javascript',
    '/bower_components/jquery/dist/jquery.js': 'text/javascript',
    '/env/config.js': 'text/javascript'
  };

  if (staticEndpoints[urlObject.pathname]) {
    var endpoint = urlObject.pathname === '/' ? './client/index.html' : './client' + urlObject.pathname;
    fs.readFile(endpoint, function(err, data) {
      response.writeHead(200, {'Content-Type': staticEndpoints[urlObject.pathname]});
      response.write(data);
      response.end();
    });
  } else if (method === 'GET' && urlObject.pathname === '/classes/messages') {
  
    var messagesCopy = storage.getMessages();
    
    if (!messagesCopy) {
      statusCode = 404;
      response.writeHead(statusCode, headers);
      response.end();
    } else {
      statusCode = 200;
      response.writeHead(statusCode, headers);

      if (urlObject.query && urlObject.query['where'] !== undefined) {
        var roomNameFilter = JSON.parse(urlObject.query['where']).roomname;
        
        messagesCopy = _.filter(messagesCopy, function(message) {
          return message.roomname === roomNameFilter;
        }); 
        var body = {results: messagesCopy};
      }

      if (urlObject.query && urlObject.query['order'] === '-createdAt') {
        reversedMessage = messagesCopy.slice().reverse();
        var body = {results: reversedMessage};
      } else {
        var body = {results: messagesCopy};
      }
      
      response.end(JSON.stringify(body));
    }

  } else if (method === 'POST' && urlObject.pathname === '/classes/messages') {
    var receivedMessage = [];

  
    request.on('data', (chunk) => {
      receivedMessage.push(chunk);
    });

    request.on('end', () => {
      receivedMessage = JSON.parse(receivedMessage.join(''));
      
      storage.addMessage(receivedMessage);

    });
    statusCode = 201;
    response.writeHead(statusCode, headers);
    response.end();
  } else if (method === 'OPTIONS') {
    headers['Content-Type'] = 'text/plain';
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end();
  } else {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end();
  }
  
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  
};


module.exports.requestHandler = requestHandler;

