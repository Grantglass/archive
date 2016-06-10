(function(){

    /** @ngInject */
    var controller = function($scope,BlakeDataService,WindowSize,$window){
        var vm = this;
        vm.bds = BlakeDataService;

        vm.firstLine = 1;
        vm.panelAdjust = 55;
        vm.scrollBarHeight = 7;

        vm.open = {
            'text':false,
            'desc': false,
            'notes':false,
            'meta':false,
            'tei':false
        };

        /*if(angular.isDefined($routeParams.open)){
            vm.open[$routeParams.open] = true;
        }*/

        vm.resize = function(adjust){
            var adjust = angular.isDefined(adjust) ? 134 - adjust : 134;
            vm.trayPixels = ( WindowSize.height - adjust );
            if(WindowSize.width <= 992){
                vm.trayHeight = 0
            } else {
                vm.trayHeight = vm.trayPixels + 'px';
            }
            vm.panelCount = 3;
            vm.trayBodyHeight = (vm.trayPixels - vm.scrollBarHeight - (vm.panelCount * vm.panelAdjust)) + 'px';

        }

        vm.resize();

        vm.newWindow = function(object,type){
            $window.open('/blake/new-window/'+type+'/'+object.copy_bad_id+'?descId='+object.desc_id, '_blank','width=800, height=600');
        }

        $scope.$on('resize::resize',function(event,window){
            vm.resize();
        });
        $scope.$on('ovpImage::ovpIncrease',function(event,adjust){
            vm.resize(adjust);
        });
        $scope.$on('copyCtrl::toggleTools',function(e,tools){
            if(tools){
                vm.resize();
            } else {
                vm.resize(-50);
            }
        })

        /*$scope.$on('copyCtrl::objectChanged',function(e,d){
            vm.object = d;
        });*/


    }

    var infoTray = function(){
        return {
            restrict: 'E',
            scope: {
                toggle: '&',
            },
            templateUrl: '/blake/static/directives/info-tray/infoTray.html',
            controller: controller,
            controllerAs: 'tray',
            bindToController: true
        };
    }

    angular.module('blake').directive("infoTray", infoTray);

}());