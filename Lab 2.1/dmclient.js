var commands = process.argv;

//call dmclient like: node dmclient.js HOST PORT "function" "argument1" "argument2"
console.log("connect to host:",commands[2],"at port:", commands[3])
exports.HOST = commands[2];
exports.PORT = commands[3];

var dm = require ('./dm_remote.js');

dm.Start(this.HOST, this.PORT, function () {
    //passing the command line arguments and check for the cases
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
}}
);
