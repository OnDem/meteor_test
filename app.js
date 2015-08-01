Chats = new Mongo.Collection("chats");

if (Meteor.isClient) {
    var lh = angular.module('lighthouse',['angular-meteor','ui.router','ui.bootstrap']);

    lh.config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
        function($urlRouterProvider, $stateProvider, $locationProvider){

          $locationProvider.html5Mode(true);

          $stateProvider
            .state('chats', {
              url: '/chats',
              templateUrl: 'chats.ng.html',
              controller: 'ChatsCtrl'
            })
            .state('newchat', {
              url: '/new/:courseId/role/:roleId/user/:userId',
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

    lh.service('sessionService',function(){
      this.userId = 0;
      this.roleId = 0;
      this.email  = '';
    });

    lh.controller('ChatsCtrl', ['$scope','$meteor', '$location', '$stateParams', 'sessionService',
        function($scope,$meteor,$location,$stateParams,sessionService){

          $scope.chats = $meteor.collection(Chats);

          if ( $stateParams.courseId > 0 && $stateParams.roleId > 0 && $stateParams.userId > 0 )
            {
              courseId = $stateParams.courseId - 0;
              $scope.roleId = sessionService.roleId = $stateParams.roleId;
              $scope.userId = sessionService.userId = $stateParams.userId;
              $scope.newchat = $meteor.object(Chats,{course:courseId});
              console.log($scope.newchat,$scope.roleId,sessionService.userId);
              if( $scope.newchat.course )
               {
                 console.log('Yes');
               }
              else
               {
                 console.log('No');
                 var newChat = {
                   'course': courseId,
                   'content': [
                      {
                        'userId': $scope.userId,
                        'username': 'новый чат',
                        'text': 'оставьте сообщение',
                        'dt': new Date()
                      }
                   ]
                 };
                 $scope.chats.push(newChat);
                 console.log(courseId);
               }
            }
          else
            {
              $scope.remove = function(chat){
                $scope.chats.splice( $scope.chats.indexOf(chat), 1 );
              };
            }
      }]);

    lh.controller('ChatCtrl', ['$scope','$meteor','$location','$stateParams','sessionService',
        function($scope,$meteor,$location,$stateParams,sessionService){

          if ( $stateParams.chatId.length > 0 )
            {
              $scope.newContent = {};

              $scope.chat = $meteor.object(Chats,$stateParams.chatId);

              $scope.addNewContent = function () {
                $scope.newContent.userId = sessionService.userId;
                switch ( sessionService.roleId ) {
                  case '5':
                    $scope.newContent.username = 'Автор';
                    break;
                  case '44':
                    $scope.newContent.username = 'Помощник';
                    break;
                  case '333':
                    $scope.newContent.username = 'Модератор';
                    break;
                  case '2222':
                    $scope.newContent.username = 'Администратор';
                    break;
                  default:
                    $scope.newContent.username = 'Аноним';
                };
                $scope.newContent.dt = new Date();
                $scope.chat.content.push($scope.newContent);

                Meteor.call('addTask',
                    $scope.newContent.userId,
                    $scope.chat.course,
                    sessionService.roleId,
                    $scope.newContent.text,
                    function(){}
                );

                $scope.newContent = {};
              };
            }
          else
            {
              $location.path('/chats');
            }

      }]);

}

if (Meteor.isServer) {

  Meteor.methods({
    'addTask': function addTask(userId,courseId,roleId,comment) {
        redis = Meteor.npmRequire('redis');
        rclient = redis.createClient();
        rclient.select(3, function() { /* ... */ });
        Sidekiq = Meteor.npmRequire('sidekiq');
        sidekiq = new Sidekiq(rclient,"TBS");

        sidekiq.enqueue("ChatNotifier", [userId,courseId,roleId,comment], {
              retry: false,
              queue: "tbsmailers"
        });
    }
  });  

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
