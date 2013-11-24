define(['angular', 'underscore', 'RTCPeerConnection'], function(angular, _, PeerConnection) {
  'use strict';
  angular.module('myApp.room', ['ngCookies'])
    .factory('$room', ['$cookies', '$log', '$cookieStore', '$rootScope',
      function($cookies, $log, $cookieStore, $rootScope) {
        var self = null;
        return {
          users: {},
          user: null,
          pc: null,
          destUserId: null,
          localStream: null,
          socket: io.connect('/'),
          remoteStreamReady: function() {
            console.log("Override this method");
          },
          pickUpCall: function() {
            console.log("Override this method");
          },
          callResult: function() {
            console.log("Override this method");
          },
          callEnded: function() {
            console.log("Override this method");
          },
          connect: function(cb, login) {
            self = this;
            this.socket.emit('connect', {
              login: login
            });
            this.socket.on('connected', function(user) {
              if (user) {
                self.user = user;
                $cookies.user = user;
                $cookieStore.put('user', user);
                return cb(null, user);
              }
              cb("Could not connect");
            });
            this.socket.on('connectedUsers', this.connectedUsers);
            this.registerCallSocketEvents();
          },
          updateUserStatus: function(newStatus) {
            self.user.status = newStatus;
            self.socket.emit('updateUserStatus', this.user.status);
          },
          connectedUsers: function(connectedUsers) {
            delete connectedUsers[self.user.id];
            self.users = connectedUsers;
            $rootScope.$broadcast("roomUpdated");
          },
          restore: function(cb) {
            $log.debug("[room] restore");
            var user = $cookieStore.get('user');
            if (user) {
              $log.debug("[room] cookie: " + user.login);
              this.connect(cb, user.login);
              return;
            }
            cb("No active session");
          },
          initPeerConnection: function() {
            if (this.pc)
              return;
            var isChrome = !! navigator.webkitGetUserMedia;
            var STUN = {
              url: isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
            };
            var TURN = {
              url: 'turn:homeo@turn.bistri.com:80',
              credential: 'homeo'
            };
            var iceServers = {
              iceServers: [STUN, TURN]
            };
            var DtlsSrtpKeyAgreement = {
              DtlsSrtpKeyAgreement: true
            };
            var constraints = {
              optional: [DtlsSrtpKeyAgreement]
            };

            this.pc = new PeerConnection(iceServers, constraints);
            this.registerPeerEvents();
            this.registerSocketSignalingEvents();
          },
          registerPeerEvents: function() {
            this.pc.on('ice', function(candidate) {
              $log.debug("send ice to:" + self.destUserId);
              self.socket.emit('ice', {
                to: self.destUserId,
                candidate: candidate
              });
            });
            this.pc.on('addStream', function(stream) {
              $log.debug("stream addded");
              self.updateUserStatus('calling');
              self.remoteStreamReady(stream);
            });
            this.pc.on('streamRemoved', function(candidate) {
              $log.debug("streamRemoved");
              self.updateUserStatus('ready');
              self.callEnded();
            });
            this.pc.on('close', function(candidate) {
              $log.debug("Closedconnection");
              self.updateUserStatus('ready');
              self.callEnded();
            });
          },
          registerSocketSignalingEvents: function() {
            this.socket.on('offer', function(offer) {
              $log.debug("on offer from: " + offer.from);
              self.destUserId = offer.from;
              self.pc.answer(offer.data, function(err, answerData) {
                $log.debug("send answer");
                if (!err)
                  self.socket.emit('answer', {
                    to: self.destUserId,
                    data: answerData
                  });
              });
            });
            this.socket.on('answer', function(answer) {
              $log.debug("on answer");
              self.pc.handleAnswer(answer.data);
            });
            this.socket.on('ice', function(ice) {
              $log.debug("on ice from: " + ice.from);
              self.pc.processIce(ice.candidate);
            });
          },
          setLocalStream: function(localStream) {
            this.updateUserStatus('ready');
            this.localStream = localStream;
            this.initPeerConnection();
            this.pc.addStream(self.localStream);
            $rootScope.$broadcast("roomUpdated");
          },
          sendOffer: function(userIdToCall) {
            this.destUserId = userIdToCall;
            this.pc.offer({
                mandatory: {
                  OfferToReceiveAudio: true,
                  OfferToReceiveVideo: true
                }
              },
              function(err, offer) {
                $log.debug("send offer");
                if (!err)
                  self.socket.emit('offer', {
                    to: self.destUserId,
                    data: offer
                  });
              }
            );
          },
          callUser: function(userIdToCall) {
            this.socket.emit('call', {
              to: userIdToCall
            });
          },
          registerCallSocketEvents: function() {
            this.socket.on('call', function(call) {
              self.pickUpCall(call.user, (function(callingUser) {
                return function(pickUpResult) {
                  self.pickUp(pickUpResult, callingUser);
                };
              })(call.user));
            });
            this.socket.on('pickUp', function(pickUp) {
              self.callResult(pickUp.pickUpResult);
              if (pickUp.pickUpResult) {
                self.sendOffer(pickUp.from);
              }
            });
          },
          pickUp: function(pickUpResult, callingUser) {
            this.socket.emit('pickUp', {
              to: callingUser.id,
              pickUpResult: pickUpResult
            });
          }
        };
      }
    ])
});