/*var net = require('net');
var HOST = '127.0.0.1';
var PORT = 9000;
var client = new net.Socket();
*/
const io = require("socket.io-client"),
      socket = io.connect("http://localhost:3000");

// Messages are objects with some specific fields
// the message itself, who sends, destination, whether is private message, timestamp
function Message (msg, from, to, isPrivate, ts) {
    this.msg=msg; this.from=from; this.isPrivate=isPrivate; this.to=to; this.ts=ts;
}

function Post (msg, from, ts) {
	this.msg=msg; this.from=from; this.ts=ts;
}

var subjects = {id0: 'Introduccion al foro', id1:'Literatura', id2:'Futbol'};
var publicMessages = {id0: [new Post ('primer mensaje', 'Foreador', new Date()),
							new Post ('SEGUNDO mensaje', 'Foreador', new Date())],
				      id2: [new Post ('primer mensaje futbolero', 'josocxe', new Date())]
			         };


addUser = function (u,p) {
	var lower = u.toLowerCase();
	var exists = false;
  var users = []
  //asking for the data with a promise and socket.emit
  var promise = new Promise( (resolve, reject) => {
            socket.on('connect', function (data) {
                socket.emit('getData', 'users');
                socket.on('data', function (userData) {
                    users = userData
                    if(!userData){
                      reject(userData);
                    } else {
                    resolve(userData);
                  }
                });
            });
        });

  //when the promise is resolved we check wether the user is already contained in the list and send it back
  promise.then(function(response){
    for (var i in users) {
  		if (i.toLowerCase() == lower) {exists = true; console.log("user already exists"); break;}
  	}
  	if (!exists) {
      users.u=p;
      socket.emit('sendData', users);
      console.log("send back data", users);
    //and send updated data back to server
  	  return !exists;
    }
  }
).catch(function(rejection){
  console.log(rejection)
});
}

//addUser("mudito","test");

// Adds a new subject to subject list. Returns -1 if already exists, id on success
exports.addSubject = function (s) {
	var lower = s.toLowerCase();
	for (var i in subjects) {
		if (subjects[i].toLowerCase() == lower) {return -1;}
	}
	var len = Object.keys(subjects).length;
	var idlen = 'id' + len;
	subjects [idlen] = s;
	return idlen;
}

exports.getSubjectList = function () {return JSON.stringify (subjects);}

getUserList1 = function () {
	var userlist = [];
  console.log("1")
  var promise = new Promise( (resolve, reject) => {
    console.log("2")
            socket.on('connect', function (data) {
              console.log("3")
                socket.emit('getData', 'users');
                socket.on('data', function (userData) {
                    if(!userData){
                      reject(userData);
                    } else {
                    resolve(userData);
                  }
                });
            });
        });
    return promise;
      };

      getUserList2 = async function(){
        console.log("got here")
        var promise = await getUserList1();
        console.log("the promise is",promise)
        promise().then(result=>{
          console.log(result)
        }).catch(err =>{
          console.log(err)
        })};

//var userlist = getUserList2();
console.log("returned: ",getUserList2());
//console.log("5")

// Tests if credentials are valid, returns true on success
exports.login = function (u, p) {
	var lower = u.toLowerCase();
	for (var i in users) {
		if (i.toLowerCase() == lower) {return (users[u] == p);}
	}
	return false; // user not found
}

// TODO: PRIVATE MESSAGES
//exports.addPrivateMessage = function (msg){}
//exports.getPrivateMessageList = function (u1, u2) {}

function getSubject (sbj) {
	for (var i in subjects) {
		if (subjects[i] == sbj) return i;
	}
	return -1; // not found
}

// adds a public message to storage
exports.addPublicMessage = function (msg)
{
	var post = new Post (msg.msg, msg.from, msg.ts);
	var ml = publicMessages [msg.to];
	if (!ml) publicMessages [msg.to] = [];
	publicMessages [msg.to].push(msg);
}

exports.getPublicMessageList = function (sbj) {
	var idx=getSubject (sbj);
	var ml=[];
	if (idx != -1) {
		ml = publicMessages [idx];
	}
	return JSON.stringify (publicMessages[sbj]);
}
