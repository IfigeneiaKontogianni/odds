angular.module('Admin', [
    'ui.bootstrap'
])
//                          WebSocket works as well
    .factory('socket', [function(){
        //Creating connection with server
        //var socket = io.connect('http://91.138.138.18:3000/admins');
        return function(chnl) {
            var socket = io.connect('http://localhost:3000'+chnl);
            socket.on('connect', function(){
                // handle server error here
            });
            socket.on('error', function(){
                // handle server error here
                //console.log('Error connecting to server');
            });
            socket.on('connect_error', function(err) {
                // handle server error here
                //console.log('Error connecting to server');

            });
            return socket;
        };
    }])

    .controller('controlpanelCtrl', function ($scope, socket) {
        $scope.disaster = false;
        $scope.myIdentity = {};
        $scope.MyData = {collection:[]};
        $scope.MyClients = {collection:[]};
        $scope.MyErrors = {collection:[]};
        $scope.channels = [];
        $scope.adminSocket = socket('/admins');
        $scope.errorSocket = socket('/error');

        $scope.adminSocket.on('connect_error', function(err) {
            // handle server error here
            //console.log('Error connecting to server');
            $scope.disaster = true;
            $scope.$apply();
        });

        $scope.getIdenity  = function(data) {
            // handle server error here
            //console.log('Error connecting to server');
            $scope.myIdentity = data;
            $scope.disaster = false;
            $scope.$apply();
        }

        $scope.adminSocket.emit('identity', $scope.getIdenity);

        $scope.closeAlert = function (index ,provider) {
            provider.collection.splice(index, 1);
            //$scope.alerts.splice(0, 1);
            $scope.$apply();
        };

        $scope.adminSocket.on('message', function (data) {
            $scope.MyData.collection.push(data);
            //console.log(data);
            $scope.$apply();
        });

        $scope.errorSocket.on('error', function (data) {
            $scope.MyErrors.collection.push(data);
            //console.log(data);
            $scope.$apply();
        });

        $scope.emitData = function (data) {
            $scope.channels = Array.from(Object.keys(data), k=>data[k]);
            //console.log(data);
            $scope.$apply();
        }

        /*$scope.emitCommand = function(socket, msg, provider){
            socket.emit(msg, function (data) {
                provider = data;
                console.log(data);
                $scope.$apply();
            });
        };*/

        //$scope.emitCommand($scope.adminSocket,'get-channels',$scope.channels);

        $scope.adminSocket.emit('get-channels', $scope.emitData);

        $scope.adminSocket.on('newclient', function (data) {
            $scope.MyClients.collection.push(data);
            //console.log(data);
            $scope.adminSocket.emit('get-channels', $scope.emitData);
            //$scope.emitCommand($scope.adminSocket,'get-channels',$scope.channels);
        });
        $scope.adminSocket.on('discclient', function (data) {
            $scope.MyClients.collection.push(data);
            //console.log(data);
            $scope.adminSocket.emit('get-channels', $scope.emitData);
            //$scope.emitCommand($scope.adminSocket,'get-channels',$scope.channels);
        });

        $scope.filterChannels = function (item) {
            return item.path?true:false
        };
    });