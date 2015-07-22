Chats = new Mongo.Collection("chats");

if (Meteor.isClient) {
    angular
      .module('lighthouse',['angular-meteor','ui.router','ui.bootstrap']);

    angular
      .module('lighthouse').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
        function($urlRouterProvider, $stateProvider, $locationProvider){

          $locationProvider.html5Mode(true);

          $stateProvider
            .state('chats', {
              url: '/chats',
              templateUrl: 'chats.ng.html',
              controller: 'ChatsCtrl'
            })
            .state('chat', {
              url: '/chats/:chatId',
              templateUrl: 'chat.ng.html',
              controller: 'ChatCtrl'
            });

            $urlRouterProvider.otherwise('/chats');
    }]);

    angular
      .module('lighthouse').controller('ChatsCtrl', ['$scope','$meteor','$stateParams',
        function($scope,$meteor,$stateParams){

          $scope.chats = $meteor.collection(Chats);

          $scope.courseId = 0;

          $scope.addNewChat = function(){
            var newChat = {
                'course': $scope.courseId,
                'content': [
                  {
                    'userId': 0,
                    'username': 'новый чат',
                    'text': 'оставьте сообщение',
                    'dt': new Date()
                  }
                ]
            };
            $scope.chats.push(newChat);
          };

          $scope.remove = function(chat){
            $scope.chats.splice( $scope.chats.indexOf(chat), 1 );
          };


      }]);

    angular
      .module('lighthouse').controller('ChatCtrl', ['$scope','$meteor','$stateParams',
        function($scope,$meteor,$stateParams){

          $scope.newContent = {};

          $scope.chat = $meteor.object(Chats, $stateParams.chatId);

          $scope.addNewContent = function () {
            $scope.newContent.userId = 3;
            $scope.newContent.username = 'bot';
            $scope.newContent.dt = new Date();
            $scope.chat.content.push($scope.newContent);
            $scope.newContent = {};
          };

      }]);

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Chats.find().count() === 0) {

      var chats = [
        {
          'course': 0,
          'content': [
            {
              'userId': 0,
              'username': 'новый чат',
              'text': 'оставьте сообщение',
              'dt': new Date()
            }
          ]
        }
      ];

      for (var i = 0; i < chats.length; i++)
        Chats.insert(chats[i]);

    }
   });
}
