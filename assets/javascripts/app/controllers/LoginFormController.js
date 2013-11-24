define(['jquery', 'underscore', 'templates'], function($, _, templates) {
  return ['$scope', '$state', '$room', function($scope, $state, $room) {
  
    $scope.submitLoginForm = function(){
      $room.connect(function(err, res){
        if(!err){
          return $state.go("chat");
        }
      }, $scope.user.login);
    };

  }];
});