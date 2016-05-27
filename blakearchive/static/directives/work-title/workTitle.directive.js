(function() {

    /** @ngInject */
    var controller = function ($rootScope,BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;

        vm.getOvpTitle = function(){
            if(vm.bds.work.virtual == true){
                if(vm.bds.copy.bad_id == 'letters'){
                    return vm.bds.object.object_group;
                } else {
                    return vm.bds.work.title;
                }
            } else {
                var copyPhrase = vm.bds.copy.archive_copy_id == null ? '' : ', Copy '+vm.bds.copy.archive_copy_id;

                if(vm.bds.copy.header){
                    copyPhrase = vm.bds.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase
                }

                return copyPhrase;
            }
        }

    }

    var workTitle = function () {

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/work-title/workTitle.html',
            controller: controller,
            controllerAs: 'workTitle',
            bindToController: true
        };
    }

    angular.module('blake').directive("workTitle", workTitle);


}());