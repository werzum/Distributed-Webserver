var commands = process.argv;
console.log("connect to host:",commands[2],"at port:", commands[3])
exports.HOST = commands[2];
exports.PORT = commands[3];

//var HOST = '127.0.0.1';
//var PORT = 9000;
var dm = require ('./dm_remote.js');//.setPort(PORT, HOST);

dm.Start(this.HOST, this.PORT, function () {
    	// Write the command to the server

      //call getPrivateMessageList with usernames
      //getSubjectList with subject ID
   	dm.getPrivateMessageList ("Foreador","josocxe", function (ml) {
   		console.log ("here it is:")
   		console.log (JSON.stringify(ml));
   	});
});
