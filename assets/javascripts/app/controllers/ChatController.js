define(['jquery', 'underscore', 'templates'], function($, _, templates) {
  return ['$scope', '$room', function($scope, $room) {

    $scope.users = $room.users;
    $scope.user = $room.user;
    $scope.$on("roomUpdated", function() {
      $scope.users = $room.users;
      $scope.user = $room.user;
      $scope.userCount = Object.keys($room.users).length;
      $scope.$apply();
    });
    var userStream;

    function initCamera(){
      navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          {
            video: true,
            audio: true
          },
          function(stream) {
            userStream = stream;
            $room.setLocalStream(stream);
            var localStreamContainer = $('.localStream')[0];
            localStreamContainer.src = window.URL.createObjectURL(userStream);
            $scope.$apply();
          },
          function(err) {
            console.log('The following error occurred when trying to use getUserMedia: ');
            console.log(err);
            $scope.$apply();
          }
        );
      } else {
        alert('Sorry, your browser does not support getUserMedia');
      }
    }

    $scope.callUser = function(userIdToCall){
      $scope.calling = true;
      $room.callUser(userIdToCall);
    };

    $room.callEnded = function(){
      $scope.calling = false;
      $scope.$apply();
    };

    $room.callResult = function(callResult){
      if(!callResult)
        alert("User did not pickup your call");
    };

    $room.pickUpCall = function(callingUser, cb){
      var pickUpResult = confirm("Accept call from " + callingUser.login);
      cb(pickUpResult);
    };

    $room.remoteStreamReady = function(remoteStreamEvent){
      var remoteStreamContainer = $('.remoteStream')[0];
      remoteStreamContainer.src = window.URL.createObjectURL(remoteStreamEvent.stream);
      $scope.calling = true;
      $scope.$apply();
    };

    initCamera();
    $scope.$apply();
  }];
});