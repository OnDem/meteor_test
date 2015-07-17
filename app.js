Properties = new Mongo.Collection("properties");

if (Meteor.isClient) {
    angular
      .module('lighthouse',['angular-meteor','ui.bootstrap']);

    angular
      .module('lighthouse').controller('PropertiesListCtrl', ['$scope','$meteor',
        function($scope,$meteor){

          $scope.properties = $meteor.collection(Properties);

          $scope.remove = function(property){
            $scope.properties.splice( $scope.properties.indexOf(property), 1 );
          };


      }]);
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Properties.find().count() === 0) {

      var properties = [
        {'name': 'Dubstep-Free Zone',
          'description': 'Can we please just for an evening not listen to dubstep.'},
        {'name': 'All dubstep all the time 234124',
          'description': 'Get it on!'},
        {'name': 'All dubstep all the time jhghg',
          'description': 'Get it on!'},
        {'name': 'All dubstep all the time jhgjjhg ',
          'description': 'Get it on!'},
        {'name': 'All dubstep all the time jhgjkhg h',
          'description': 'Get it on!'},
        {'name': 'Savage lounging',
          'description': 'Leisure suit required. And only fiercest manners.'}
      ];

      for (var i = 0; i < properties.length; i++)
        Properties.insert(properties[i]);

    }
   });
}
