var express = require('express'),
  routes = require('./routes'),
  engines = require('consolidate'),
  // passport = require('passport'),
  // LocalStrategy = require('passport-local').Strategy,
  // Sequelize = require('sequelize-mysql').sequelize,
  // crypto = require('crypto'),
  io = require('socket.io'),
  fs = require('fs'),
  // exec = require('child_process').exec,
  util = require('util'),
  _ = require('underscore');

exports.startServer = function(config, callback) {

  var port = process.env.PORT || config.server.port;

  var app = express();
  var server = app.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
  });

  app.configure(function() {
    app.set('port', port);
    app.set('views', config.server.views.path);
    app.engine(config.server.views.extension, engines[config.server.views.compileWith]);
    app.set('view engine', config.server.views.extension);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.compress());
    app.use(config.server.base, app.router);
    app.use(express.static(config.watch.compiledDir));
    app.use(express.cookieParser());
    app.use(express.session({
      secret: "IlEstVenuLeTempsDesCathedrales$42"
    }));
    // app.use(passport.initialize());
    // app.use(passport.session());
  });

  var users = {};
  var userIdIndex = 0;
  var sockets = {};
  io = io.listen(server, { log: false });

  io.sockets.on('connection', function(socket) {
    var connectUser = function(newUser){
      if(!newUser)
        return;
      newUser.id = ++userIdIndex;
      newUser.status = 'connected';
      socket.userId = newUser.id;
      sockets[newUser.id] = socket;
      users[newUser.id] = newUser;
      console.log("new user registration: " + newUser.login + ' ' + newUser.id);
      socket.emit('connected', newUser);
      refreshConnectedUsers();
    };

    var disconnectUser = function(){
      var userId = socket.userId;
      console.log("disconnect: " + userId);
      delete users[userId];
      delete sockets[userId];
      refreshConnectedUsers();
    };

    var refreshConnectedUsers = function(newUser){
      console.log("refresh connected users: ");
      console.log(users);
      socket.broadcast.emit('connectedUsers', users);
      socket.emit('connectedUsers', users);
    };

    socket.on('connect', function(newUser) { //data contains the variables that we passed through in the html file
      connectUser(newUser);
    });

    socket.on('disconnect', function() { //data contains the variables that we passed through in the html file
      disconnectUser();
    });

    socket.on('offer', function(offer) { //data contains the variables that we passed through in the html file
      console.log("handleOffer from: " + socket.userId + " to: " + offer.to);
      sockets[offer.to].emit('offer', {from:socket.userId, data: offer.data});
    });

    socket.on('answer', function(answer) { //data contains the variables that we passed through in the html file
      console.log("handleAnswer from: " + socket.userId + " to: " + answer.to);
      sockets[answer.to].emit('answer', {from:socket.userId, data: answer.data});
    });

    socket.on('ice', function(ice) { //data contains the variables that we passed through in the html file
      console.log("handleIceCandidat from: " + socket.userId + " to: " + ice.to);
      sockets[ice.to].emit('ice', {from:socket.userId, candidate: ice.candidate});
    });

    socket.on('updateUserStatus', function(newStatus) { //data contains the variables that we passed through in the html file
      users[socket.userId].status = newStatus;
      refreshConnectedUsers();
    });

    socket.on('call', function(call) { //data contains the variables that we passed through in the html file
      console.log("handleCall from: " + socket.userId + " to: " + call.to);
      sockets[call.to].emit('call', {from:socket.userId, user: users[socket.userId]});
    });

    socket.on('pickUp', function(pickUp) { //data contains the variables that we passed through in the html file
      console.log("handlePickUp from: " + socket.userId + " to: " + pickUp.to);
      sockets[pickUp.to].emit('pickUp', {from:socket.userId, pickUpResult: pickUp.pickUpResult});
    });

  });

  app.configure('development', function() {
    app.use(express.errorHandler());
  });

  app.get('/', routes.index(config));

  callback(server, io);
};