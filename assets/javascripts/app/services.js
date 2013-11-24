define(['angular'], function(angular) {
  'use strict';
  angular.module('myApp.services', [])
    .factory('$API', ['$http', '$q',
      function($http, $q) {
        return {
          communicate: function(cb, apiPath, data, method) {
            var domain = "";
            var conf = {
              url: domain + apiPath
            };
            if (method == 'POST') {
              conf['method'] = 'POST';
              conf['headers'] = {
                'Content-Type': 'application/x-www-form-urlencoded'
              };
              conf["data"] = $.param(data);
            } else {
              conf['method'] = 'GET';
              if (data)
                conf['params'] = data;
            }
            console.log("### API CALL ###");
            console.log(conf);
            $http(conf)
              .success(function(data) {
                console.log("response: ");
                console.log(data);
                cb(null, data);
              })
              .error(function() {
                cb("Error: unable to get data from server");
              });
          },
          getPosts: function(cb) {
            return this.communicate(cb, '/posts');
          },
          getFiles: function(cb) {
            return this.communicate(cb, '/files');
          }
        };
      }
    ])
});