
var subjects = {id0: 'Introduccion al foro', id1:'Literatura', id2:'Futbol'};
var users = { Foreador: '1234',
			  mudito: '1234',
			  troll: '1234',
			  josocxe: '1234'};

var publicMessages = {id0: [new Post ('primer mensaje', 'Foreador', new Date()),
										new Post ('SEGUNDO mensaje', 'Foreador', new Date())],
							      id2: [new Post ('primer mensaje futbolero', 'josocxe', new Date())]
						         };
										 
function Message (msg, from, to, isPrivate, ts) {
   this.msg=msg; this.from=from; this.isPrivate=isPrivate; this.to=to; this.ts=ts;
}


function Post (msg, from, ts) {
	this.msg=msg; this.from=from; this.ts=ts;
}


exports.getDefaultMessages = function(){return JSON.stringify(publicMessages)}
exports.getUserList = function () {return JSON.stringify (users);}
exports.getSubjectList = function () {return JSON.stringify (subjects);}
