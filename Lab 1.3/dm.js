// Messages are objects with some specific fields
// the message itself, who sends, destination, whether is private message, timestamp
function Message (msg, from, to, isPrivate, ts) {
    this.msg=msg; this.from=from; this.isPrivate=isPrivate; this.to=to; this.ts=ts;
}

function Post (msg, from, ts) {
	this.msg=msg; this.from=from; this.ts=ts;
}

var subjects = {id0: 'Introduccion al foro', id1:'Literatura', id2:'Futbol'};
var users = { Foreador: '1234',
			  mudito: '1234',
			  troll: '1234',
			  josocxe: '1234'
			};
var publicMessages = {id0: [new Post ('primer mensaje', 'Foreador', new Date()),
							new Post ('SEGUNDO mensaje', 'Foreador', new Date())],
				      id2: [new Post ('primer mensaje futbolero', 'josocxe', new Date())]
			         };

// first field name is nick1_nick2, where nick1 is less than nick2 in alpahabetic order
var privateMessages =
	{Foreador_josocxe: [new Post ('Hola mudito', 'Foreador', new Date()),
						new Post ('Hola amigo, te gusta el foro?', 'josocxe', new Date()),
						new Post ('Ta chachi', 'Foreador', new Date())],
	 mudito_troll: [new Post ('Hola', 'troll', 'mudito', new Date()),
	 				new Post ('Oye, porqué no contestas?', 'troll', new Date())],
	 josocxe_mudito: [new Post ('Amunt València !!', 'josocxe', new Date())]
	 };


// true if already exists
exports.addUser = function (u,p) {
	var lower = u.toLowerCase();
	var exists = false;
	for (var i in users) {
		if (i.toLowerCase() == lower) {exists = true; break;}
	}
	if (!exists) users[u] = p;
	return exists;
}

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

exports.getSubjectList = function () {
	return JSON.stringify (subjects);
}


exports.getUserList = function () {
	var userlist = [];
	for (var i in users) userlist.push (i);
	return JSON.stringify (userlist);
}

// Tests if credentials are valid, returns true on success
exports.login = function (u, p) {
	var lower = u.toLowerCase();
	for (var i in users) {
		if (i.toLowerCase() == lower) {return (users[u] == p);}
	}
	return false; // user not found
}

exports.addPrivateMessage = function (msg){
	// lower user us always first
	var u1=msg.from;
	var u2=msg.to;
	var k = (u1.toLowerCase().localeCompare(u2.toLowerCase())<0) ? u1+'_'+u2:u2+'_'+u1;
	var ml = privateMessages [k];
	if (!ml) privateMessages [k] = [];
	privateMessages[k].push (msg);
}

exports.getPrivateMessageList = function (u1, u2) {
	// lower user us always first
  console.log("at dm:", u1, u2)
	var k = (u1.toLowerCase().localeCompare(u2.toLowerCase())<0) ? u1+'_'+u2:u2+'_'+u1;
	console.log ("private message list key:" + k);
	return JSON.stringify (privateMessages[k]);
}

function getSubject (sbj) {
	for (var i in subjects) {
		if (subjects[i] == sbj) return i;
	}
	return -1; // not found
}

// adds a public message to storage
exports.addPublicMessage = function (msg)
{
	var ml = publicMessages [msg.to];
	if (!ml) publicMessages [msg.to] = [];
	publicMessages [msg.to].push(msg);
}

exports.getPublicMessageList = function (sbj) {
	return JSON.stringify (publicMessages[sbj]);
}
