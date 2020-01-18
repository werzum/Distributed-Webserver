
//splitting the commands so that:
//every first value is a reqAdresses,every second a publishAddress
let commands = process.argv;
commands = commands.slice(2)
let reqAdresses = commands.filter(function(value, index, Arr) {
    return index % 2 == 0;
});
let publishAddress = commands.filter(function(value, index, Arr) {
    return (index+1) % 2 == 0;
});

//starting a new Server for the addresses
reqAdresses.forEach((item, i) => {
  runMultipleSevers(reqAdresses[i], publishAddress[i], publishAddress, i);
});

function runMultipleSevers(reqAdresses, publishAddress, publishAddressArray, index){

//importing everything we need
var zmq = require("zeromq");
var responder = zmq.socket("rep")
var dm = require ('./dm.js');
var commands = process.argv;
var reqresport = "tcp://127.0.0.1:"+reqAdresses;
var publishport = "tcp://127.0.0.1:"+publishAddress;
responder.bind(reqresport, function(err){
  if (err){console.log(err)}else{
    console.log("DMserver listening on ", reqresport)
  }}
)

console.log("forum ports are", reqresport, "and puport",publishport)

//for the pub/sub of public messages:
var publisher = zmq.socket("pub");
publisher.bindSync(publishport);
console.log("Publisher bound to ",publishport);

//Subscribing to all other addresses
subscriber = zmq.socket("sub");
//selecting all other servers that have not been assigned and subscribe
//making a deepcopy of the list
let tempList = JSON.parse(JSON.stringify(publishAddressArray));
tempList.splice(index, 1, "a")
for (var i = 0; i < tempList.length; i++) {
  if (tempList[i]!=="a"){
  subscriber.connect("tcp://127.0.0.1:"+tempList[i]);
  subscriber.subscribe("checkpoint")
  console.log(publishport," subscribed to ", tempList[i])
 }
}

subscriber.on("message", function(topic, message) {
  //letting the message buffer, converting it to the
  //right format, adding timestamp and finally sending it
  //per responder to the Webserver
  console.log(publishport,"received a message")
  let invo = JSON.parse(message.toString());
  let reply = {what:invo.what, invoId:invo.invoId};
  reply.obj = dm.addPublicMessage (invo.msg);
  console.log(invo)
  //sending back to forum, not working somehow
  publisher.send(["forum message", JSON.stringify(invo)])
  //responder.send (JSON.stringify(reply));
  //console.log("and our current message list:", dm.getPublicMessageList("id0"), "on DMserver with port", port)
});

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
          console.log("publishing to everyone")
          publisher.send(["checkpoint", JSON.stringify(invo)]);
          //console.log("sending back to our own webserver")
          //responder.send (JSON.stringify(reply));
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

/*
exports.startPubSubServers = function(port, addressList, index){

  subscriber = zmq.socket("sub");
  publisher = zmq.socket("pub");
  publisher.bindSync(port);
  console.log("Publisher bound to ",port);

  //making a deepcopy of the list
  let tempList = JSON.parse(JSON.stringify(addressList));

  //selecting all other servers that have not been assigned and subscribe
  tempList.splice(index, 1, "a")
  for (var i = 0; i < tempList.length; i++) {
    if (tempList[i]!=="a"){
    subscriber.connect(tempList[i]);
    subscriber.subscribe("checkpoint")
	 }
  }

  subscriber.on("message", function(topic, message) {
    //letting the message buffer, converting it to the
    //right format, adding timestamp and finally sending it
    //per responder to the Webserver
      let invo = JSON.parse(message.toString());
      let reply = {what:invo.what, invoId:invo.invoId};
      reply.obj = dm.addPublicMessage (invo.msg);
      //sending back to forum, not working somehow
      publisher.send(["forum message", JSON.stringify(reply)])
      responder.send (JSON.stringify(reply));
      console.log("and our current message list:", dm.getPublicMessageList("id0"), "on DMserver with port", port)
    });
}*/
}
