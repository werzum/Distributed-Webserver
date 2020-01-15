var dm = require ('./dm.js');

// true if already exists
exports.addUser = function (u,p, cb) {
	var exists = dm.addUser(u,p);
	cb (exists);
}

// Adds a new subject to subject list. Returns -1 if already exists, id on success
exports.addSubject = function (s, cb) {
	var id = dm.addSubject (s);
	cb (id);
}

exports.getSubjectList = function (cb) {
	var list = dm.getSubjectList ();
	cb (list);
}

exports.getUserList = function (cb) {
	var list = dm.getUserList ();
	cb (list);
}

// Tests if credentials are valid, returns true on success
exports.login = function (u, p, cb) {
	var ok = dm.login (u,p);
	cb (ok);
}

exports.addPrivateMessage = function (msg, cb){
	dm.addPrivateMessage (msg);
	cb();
}

exports.getPrivateMessageList = function (u1, u2, cb) {
	var list = dm.getPrivateMessageList (u1,u2);
	cb (list);
}

function getSubject (sbj, cb) {
	var id = dm.getSubject (sbj);
	cb (id);
}

// adds a public message to storage
exports.addPublicMessage = function (msg, cb)
{
	dm.addPublicMessage (msg);
	cb ();
}

exports.getPublicMessageList = function (sbj, cb) {
	var list = dm.getPublicMessageList (sbj);
	cb (list);
}

