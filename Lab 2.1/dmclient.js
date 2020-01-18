var commands = process.argv;

port = "tcp://127.0.0.1:"+commands[2];
var dm = require ('./dm_remote.js');
console.log(port)
dm.StartReq(port);

    switch (commands[3]) {
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
        dm.getPublicMessageList (commands[4], function (ml) {
       		console.log ("here it is:")
       		console.log (JSON.stringify(ml));
       	});
        break;
      case 'get private message list':
        dm.getPrivateMessageList (commands[4], commands[5], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add private message':
        dm.addPrivateMessage (commands[4], function (ml) {
          console.log ("here it is:")
          console.log("Event: message: " + msgStr);
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add public message':
        dm.addPublicMessage (commands[4], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add subject':
        dm.addSubject (commands[4], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'add user':
        dm.addUser (commands[4], commands[5], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      case 'login':
        dm.login (commands[4], commands[5], function (ml) {
          console.log ("here it is:")
          console.log (JSON.stringify(ml));
        });
        break;
      }
