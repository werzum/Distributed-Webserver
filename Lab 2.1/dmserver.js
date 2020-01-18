var zmq = require("zeromq");
var responder = zmq.socket("rep")
var dm = require ('./dm.js');
var commands = process.argv;
var reqresport = "tcp://127.0.0.1:"+commands[2];
var publishport = "tcp://127.0.0.1:"+commands[3];


console.log("forum ports are", reqresport, "and puport",publishport)

responder.bind(reqresport, function(err){
  if (err){console.log(err)}else{
    console.log("DMserver listening on ", reqresport)
  }}
)

//regular message propagation
responder.on('message', function(data) {

    console.log('request comes in...' + data);
    var str = data.toString();
    var strRounds = str.replace("}{","}*{").split("*");
    strRounds.forEach((part, i) => {
      var invo = JSON.parse (part);
      var reply = {what:invo.what, invoId:invo.invoId};
      switch (invo.what) {
        case 'get subject list':
          reply.obj = dm.getSubjectList();
          break;
        case 'get user list':
          reply.obj = dm.getUserList();
          break;
        case 'get public message list':
          reply.obj = dm.getPublicMessageList (invo.sbj);
          break;
        case 'get private message list':
          reply.obj = dm.getPrivateMessageList (invo.u1, invo.u2);
          break;
        case 'add private message':
          reply.obj = dm.addPrivateMessage (invo.msg);
          break;
        case 'add public message':

          reply.obj = dm.addPublicMessage (invo.msg);
          console.log("reply:",reply, "invo", invo)
          publisher.send(["forum message", JSON.stringify(invo)]);
          break;
        case 'add subject':
          reply.obj = dm.addSubject (invo.sbj);
          break;
        case 'add user':
          reply.obj = dm.addUser (invo.u, invo.p);
          break;
        case 'login':
          reply.obj = dm.login (invo.u, invo.p);
          break;
      }
      responder.send (JSON.stringify(reply));
    });

    // Add a 'close' event handler to this instance of socket
    responder.on('close', function(data) {
        console.log('Connection closed');
    });
  }
)

//for the pub/sub of public messages:
var publisher = zmq.socket("pub");
publisher.bindSync(publishport);
console.log("Publisher bound to ",publishport);
