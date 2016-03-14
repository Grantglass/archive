(function(){

    var controller = function($scope,$sessionStorage){
        var vm = this;

        vm.$storage = $sessionStorage;

        vm.getOvpTitle = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    return vm.work.title;
                } else {
                    var copyPhrase = vm.copy.archive_copy_id == null ? '' : ', Copy '+vm.copy.archive_copy_id;
                    return vm.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase;
                }
            }
        }
        vm.getOvpSubtitle = function(object){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    return 'Object '+object.object_number + object.full_object_id.replace(/object [\d]+/g,'');
                } else {
                    return object.full_object_id;
                }
            }
        };

    }

    controller.$inject = ['$scope', '$sessionStorage'];

    var objectReading = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-reading/objectReading.html',
            controller: controller,
            scope: {
                copy: '=copy',
                work: '=work',
                changeObject: '&'
            },
            controllerAs: 'read',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectReading", objectReading);

}());