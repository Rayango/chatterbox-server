var fs = require('fs');


var addMessage = function(newMessage) {
 //  messages.unshift(data);
  fs.readFile('./data/messages.json', 'utf-8', function(err, data) {
    if (err) {
      console.log('Issue reading from messages.json');
    }
    var currentMessages = JSON.parse(data);
    var nextObjectId = +currentMessages[0].objectId + 1;

    newMessage['objectId'] = nextObjectId.toString();
    nextObjectId++;

    currentMessages.unshift(newMessage);
  
    fs.writeFile('./data/messages.json', JSON.stringify(currentMessages, null, 4), function(err) {
      if (err) {
        console.log('Issue writing to messages.json');
      }
      console.log('Messages successfully written to file');
    });
  });
};


var getMessages = function () {
  var fileMessages = fs.readFileSync('./data/messages.json', 'utf-8');
  console.log('read from file');
  
  return fileMessages ? JSON.parse(fileMessages) : null;
};


module.exports.addMessage = addMessage;
module.exports.getMessages = getMessages;



// [{"username":"ginger","text":"hello44444","roomname":"lobby","objectId":"3"},{"username":"ginger","text":"hello 1","roomname":"lobby","objectId":"3"},{"username":"ginger","text":"testing MessagE! ","roomname":"lobby","objectId":"3"},{"createdAt":"2017-12-19T00:08:57.046Z","objectId":"2","roomname":"lobby","text":"f","updatedAt":"2017-12-19T00:08:57.046Z","username":"asf"},{"username":"mary","objectId":"1","text":"hi","roomname":"lobby"},{"username":"tim","objectId":"0","text":"yo","roomname":"lobby"}]