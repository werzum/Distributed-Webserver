var commands = process.argv;

//call dmclient like: node dmclient.js HOST PORT "function" "argument1" "argument2"
console.log("connect to host:",commands[2],"at port:", commands[3])
host = commands[2];
port = "tcp://127.0.0.1:"+commands[3];
var dm = require ('./dm_remote.js');
console.log(port)
dm.StartClient(port);

console.log(commands[4])

    switch (commands[4]) {
      case 'get subject list':
        dm.getSubjectList (function (ml) {
       		console.log ("here it is:")
       		console.log (JSON.stringify(ml));
       	});
        break;
      case 'get user list':
        dm.getUserList (function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'get public message list':
        dm.getPublicMessageList (commands[5], function (ml) {
       		console.log ("here it is:")
       		console.log (JSON.stringify(ml));
       	});
        break;
      case 'get private message list':
        dm.getPrivateMessageList (commands[5], commands[6], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add private message':
        dm.addPrivateMessage (commands[5], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add public message':
        console.log("adding message")
        //var msg = JSON.parse(commands[5])
        //msg.ts = new Date()
        dm.addPublicMessage (commands[5], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add subject':
        dm.addSubject (commands[5], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add user':
        dm.addUser (commands[5], commands[6], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'login':
        dm.login (commands[5], commands[6], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      }
