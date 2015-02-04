angular.module('blake', ['ngRoute']).config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/blake/', {
        templateUrl: '/blake/static/html/home.html',
        controller: "HomeController"
    });
    $routeProvider.when('/object/:objectId', {
        templateUrl: '/static/html/object.html',
        controller: "ObjectController"
    });
    $routeProvider.when('/copy/:copyId', {
        templateUrl: '/static/html/copy.html',
        controller: "CopyController"
    });
    $routeProvider.when('/work/:workId', {
        templateUrl: '/static/html/work.html',
        controller: "WorkController"
    });
    $routeProvider.when('/compare/', {
        templateUrl: '/static/html/compare.html',
        controller: "CompareController"
    });
    $routeProvider.when('/blake/search/', {
        templateUrl: '/blake/static/html/search.html',
        controller: "SearchController"
    });

    $routeProvider.otherwise({redirectTo: '/blake/'});
    $locationProvider.html5Mode(true);
});

angular.module('blake').factory("GenericService", function () {
    return function (constructor) {
        return {
            create: function (config) {
                var i, result;
                if (config.length) {
                    result = [];
                    for (i = 0; i < config.length; i++) {
                        result.push(constructor(config[i]));
                    }
                } else {
                    result = constructor(config);
                }
                return result;
            }
        };
    }
});

angular.module('blake').factory("BlakeObject", function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeObject.
     *
     * @param config
     */
    var constructor = function (config) {
        var obj = angular.copy(config);
        obj.illustration_description = angular.fromJson(config.illustration_description);
        obj.characteristics = angular.fromJson(config.characteristics);
        obj.text = angular.fromJson(config.text);
        return obj;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeCopy", function (BlakeObject, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
     * BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, copy = {
            copy_id: config.copy_id,
            work_id: config.work_id,
            header: angular.fromJson(config.header),
            objects: []
        };
        if (config.objects) {
            for (i = 0; i < config.objects.length; i++) {
                copy.objects.push(BlakeObject.create(config.objects[i]));
            }
        }
        return copy;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeWork", function (BlakeCopy, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeWork, with child objects transformed into the
     * BlakeCopies.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, work = {work_id: config.work_id, bad_id: config.bad_id, copies: []};
        if (config.copies) {
            for (i = 0; i < config.copies.length; i++) {
                work.copies.push(BlakeCopy.create(config.copies[i]));
            }
        }
        return work;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeVirtualWorkGroup", function (BlakeWork, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeVirtualWorkGroup, with child objects transformed
     * into the BlakeWorks.
     *
     * @param config
     */
    var constructor = function (config) {
        // TODO: double check if virtual work groups have a document
        var i, work = {id: config.id, document: config.document, works: []};
        for (i = 0; i < config.works.length; i++) {
            work.works.push(BlakeWork.create(config.works[i]));
        }
        return work;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeComparableGroup", function (BlakeObject, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeComparableGroup, with child objects transformed
     * into the BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, comparableGroup = {id: config.id, objects: []};
        for (i = 0; i < config.objects.length; i++) {
            comparableGroup.objects.push(BlakeObject.create(config.objects[i]));
        }
        return comparableGroup;
    };

    return GenericService(constructor);
});

/**
 * For the time being, all data accessor functions should be placed here.  This service should mirror the API
 * of the back-end BlakeDataService.
 */
angular.module('blake').factory("BlakeDataService", function ($http, $q, BlakeWork, BlakeCopy, BlakeObject, BlakeVirtualWorkGroup, BlakeComparableGroup) {
    return {
        query: function (config) {
            var url = '/blake/api/query';
            return $q(function(resolve, reject) {
                $http.post(url, config).success(function (data) {
                    resolve(data);
                }).error(function (data, status) {
                    reject(data, status);
                });
            });
        },
        getObject: function (objectId) {
            var url = '/api/object/' + objectId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeObject.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getObjectsWithSameMotif: function (objectId) {

        },
        getObjectsFromSameMatrix: function (objectId) {

        },
        getObjectsFromSameProductionSequence: function (objectId) {

        },
        getCopy: function (copyId) {
            var url = '/api/copy/' + copyId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeCopy.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getObjectsForCopy: function (copyId) {

        },
        getWork: function (workId) {
            var url = '/api/work/' + workId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeWork.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getWorks: function () {

        },
        getCopiesForWork: function (workId) {

        },
        getVirtualWorkGroup: function (virtualWorkGroupId) {
            var url = '/api/virtual_work_group/' + virtualWorkGroupId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeVirtualWorkGroup.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getComparableGroup: function (comparableGroupId) {
            var url = '/api/comparable_group/' + comparableGroupId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeComparableGroup.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        }
    };
});

angular.module('blake').controller('menuController', ['$scope', 'BlakeDataService', function($scope, BlakeDataService) {
    $scope.data = [{"info": null, "composition_date": 1784, "medium": "ms", "bad_id": "bb74", "title": "An Island in the Moon", "work_id": 1}, {"info": null, "composition_date": 1791, "medium": "mono", "bad_id": "but244", "title": "Drawings for Wollstonecraft's Original Stories", "work_id": 2}, {"info": null, "composition_date": 1791, "medium": "comb", "bad_id": "bb514", "title": "Mary Wollstonecraft, Original Stories", "work_id": 3}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt27april1804", "title": "Letter to William Hayley, 27 April 1804", "work_id": 4}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but400", "title": "The Angel Gabriel Appearing to Zacharias", "work_id": 5}, {"info": null, "composition_date": 1805, "medium": "penc", "bad_id": "but624r", "title": "Sketch for Robert Blair's 'The Grave': 'The Death of the Strong Wicked Man'", "work_id": 6}, {"info": null, "composition_date": 1806, "medium": "penc", "bad_id": "but614r", "title": "Sketch for an Alternative Title-Page for Robert Blair's 'The Grave'", "work_id": 7}, {"info": null, "composition_date": 1795, "medium": "comb", "bad_id": "bb515", "title": "Edward Young, Night Thoughts, colored copy", "work_id": 8}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but611", "title": "An Angel with a Trumpet", "work_id": 9}, {"info": null, "composition_date": 1805, "medium": "mono", "bad_id": "but612", "title": "An Angel Awakening the Dead with a Trumpet", "work_id": 10}, {"info": null, "composition_date": 1822, "medium": "wc", "bad_id": "but537", "title": "Illustrations to Milton's Paradise Lost", "work_id": 11}, {"info": null, "composition_date": 1808, "medium": "wc", "bad_id": "but536", "title": "Illustrations to Milton's Paradise Lost", "work_id": 12}, {"info": null, "composition_date": 1807, "medium": "wc", "bad_id": "but529", "title": "Illustrations to Milton's Paradise Lost", "work_id": 13}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but435", "title": "The Creation of Eve", "work_id": 14}, {"info": null, "composition_date": 1804, "medium": "illbk", "bad_id": "jerusalem", "title": "Jerusalem The Emanation of The Giant Albion", "work_id": 15}, {"info": null, "composition_date": 1805, "medium": "penc", "bad_id": "but621r", "title": "Sketch for Robert Blair's 'The Grave': 'Christ Descending into the Grave, with the Keys of Death and Hell'", "work_id": 16}, {"info": null, "composition_date": 1805, "medium": "mono", "bad_id": "but636", "title": "The Gambols of Ghosts According with Their Affections Previous to the Final Judgment", "work_id": 17}, {"info": null, "composition_date": 1805, "medium": "rmoth", "bad_id": "inscbut633", "title": "Illustrations to Robert Blair's The Grave, related materials", "work_id": 18}, {"info": null, "composition_date": 1805, "medium": "penc", "bad_id": "but625", "title": "Sketch for Robert Blair's 'The Grave': 'The Soul Hovering over the Body Reluctantly Parting with Life'", "work_id": 19}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but638", "title": "The Descent of Man into the Vale of Death: 'But Hope Rekindled, Only to Illume the Shades of Death, and Light her to the Tomb'", "work_id": 20}, {"info": null, "composition_date": 1805, "medium": "penc", "bad_id": "but624v", "title": "Sketch for Robert Blair's 'The Grave': 'Heaven's Portals Wide Expand to Let Him In'", "work_id": 21}, {"info": null, "composition_date": 1803, "medium": "rmoth", "bad_id": "inscbut505", "title": "The Ascension, related materials", "work_id": 22}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but505", "title": "The Ascension", "work_id": 23}, {"info": null, "composition_date": 1805, "medium": "spb", "bad_id": "esxiii", "title": "Deaths Door", "work_id": 24}, {"info": null, "composition_date": 1805, "medium": "penc", "bad_id": "but623", "title": "Sketch for Robert Blair's 'The Grave': 'The Meeting of a Family in Heaven'", "work_id": 25}, {"info": null, "composition_date": 1805, "medium": "penc", "bad_id": "but629", "title": "Sketch for Robert Blair's 'The Grave': 'The Soul Exploring the Recesses of the Grave'", "work_id": 26}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "butwba10", "title": "Illustrations to Robert Blair's \"The Grave\"", "work_id": 27}, {"info": null, "composition_date": 1805, "medium": "comdes", "bad_id": "bb435", "title": "Robert Blair, The Grave", "work_id": 28}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but426", "title": "The Body of Christ Borne to the Tomb", "work_id": 29}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but425", "title": "The Agony in the Garden", "work_id": 30}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but424", "title": "The Last Supper: 'Verily I Say Unto You that One of You Shall Betray Me'", "work_id": 31}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but420", "title": "Christ Giving Sight to Bartimaeus", "work_id": 32}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "lt1827", "title": "Letter to John Linnell, c. February 1827", "work_id": 33}, {"info": null, "composition_date": 1805, "medium": "ltr", "bad_id": "lt4june1805", "title": "Letter to William Hayley, 4 June 1805", "work_id": 34}, {"info": null, "composition_date": 1825, "medium": "ltr", "bad_id": "lt1825", "title": "Letter to John Linnell, c. March 1825", "work_id": 35}, {"info": null, "composition_date": 1805, "medium": "ltr", "bad_id": "lt27nov1805", "title": "Letter to William Hayley, 27 November 1805", "work_id": 36}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but429", "title": "'Christ The Mediator': Christ Pleading Before the Father for St. Mary Magdalene", "work_id": 37}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but504", "title": "The Magdalene at the Sepulchre", "work_id": 38}, {"info": null, "composition_date": 1825, "medium": "rm", "bad_id": "rellt11oct1825", "title": "Letter to Mrs. Linnell, 11 October 1825, related materials", "work_id": 39}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but506", "title": "The Conversion of Saul", "work_id": 40}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but507", "title": "St. Paul Preaching in Athens", "work_id": 41}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but500", "title": "Christ in the Sepulchre, Guarded by Angels", "work_id": 42}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but501", "title": "The Angel Rolling the Stone Away from the Sepulchre", "work_id": 43}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but502", "title": "The Resurrection", "work_id": 44}, {"info": null, "composition_date": 1805, "medium": "rmoth", "bad_id": "inscbut502", "title": "The Resurrection, related materials", "work_id": 45}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but503", "title": "The Three Maries at the Sepulchre", "work_id": 46}, {"info": null, "composition_date": 1826, "medium": "spb", "bad_id": "bb448", "title": "Blake's Illustrations of Dante", "work_id": 47}, {"info": null, "composition_date": 1824, "medium": "wc", "bad_id": "but812", "title": "Illustrations to Dante's Divine Comedy", "work_id": 48}, {"info": null, "composition_date": 1800, "medium": "rm", "bad_id": "rellt1sept1800", "title": "Letter to George Cumberland, 1 September 1800, related materials", "work_id": 49}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt22june1804", "title": "Letter to William Hayley, 22 June 1804", "work_id": 50}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt4may1804", "title": "Letter to William Hayley, 4 May 1804", "work_id": 51}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt31jan1826", "title": "Letter to John Linnell, 31 January 1826", "work_id": 52}, {"info": null, "composition_date": 1825, "medium": "ltr", "bad_id": "lt7june1825", "title": "Letter to John Linnell, 7 June 1825", "work_id": 53}, {"info": null, "composition_date": 1807, "medium": "wc", "bad_id": "but620", "title": "Design for the Dedication to Blair's 'Grave'", "work_id": 54}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt16july1826", "title": "Letter to John Linnell, 16 July 1826", "work_id": 55}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt12sept1800", "title": "Letter to John Flaxman, 12 September 1800", "work_id": 56}, {"info": null, "composition_date": 1825, "medium": "wc", "bad_id": "but480", "title": "The Parable of the Wise and Foolish Virgins", "work_id": 57}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "lt12april1827", "title": "Letter to George Cumberland, 12 April 1827", "work_id": 58}, {"info": null, "composition_date": 1827, "medium": "spb", "bad_id": "esxxi", "title": "George Cumberland's Card", "work_id": 59}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt6may1800", "title": "Letter to William Hayley, 6 May 1800", "work_id": 60}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt7april1804", "title": "Letter to William Hayley, 7 April 1804", "work_id": 61}, {"info": null, "composition_date": 1789, "medium": "illbk", "bad_id": "thel", "title": "The Book of Thel", "work_id": 62}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "ltfeb1827", "title": "Letter to John Linnell, c. February 1827", "work_id": 63}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but295", "title": "God Judging Adam", "work_id": 64}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but296", "title": "God Judging Adam", "work_id": 65}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but294", "title": "God Judging Adam", "work_id": 66}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but482", "title": "Christ Healing the Woman With an Issue of Blood", "work_id": 67}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt2july1800", "title": "Letter to George Cumberland, 2 July 1800", "work_id": 68}, {"info": null, "composition_date": 1800, "medium": "rmoth", "bad_id": "inscbut494", "title": "Christ Crucified Between the Two Thieves, related materials", "work_id": 69}, {"info": null, "composition_date": 1825, "medium": "ltr", "bad_id": "lt10nov1825", "title": "Letter to John Linnell, 10 November 1825", "work_id": 70}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but452", "title": "The Sacrifice of Jephthah's Daughter", "work_id": 71}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but453", "title": "Samson Breaking His Bonds", "work_id": 72}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but450", "title": "Jephthah Met by His Daughter", "work_id": 73}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but457", "title": "Goliath Cursing David", "work_id": 74}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but455", "title": "Samson Subdued", "work_id": 75}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "inscbut455", "title": "Samson Subdued, related materials", "work_id": 76}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt16march1804", "title": "Letter to William Hayley, 16 March 1804", "work_id": 77}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but458", "title": "The Ghost of Samuel Appearing to Saul", "work_id": 78}, {"info": null, "composition_date": 1800, "medium": "rmoth", "bad_id": "inscbut458", "title": "The Ghost of Samuel Appearing to Saul, related materials", "work_id": 79}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but515", "title": "The Four and Twenty Elders Casting Their Crowns Before the Divine Throne", "work_id": 80}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt18dec1804", "title": "Letter to William Hayley, 18 December 1804", "work_id": 81}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but512", "title": "The Death of the Virgin", "work_id": 82}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but297", "title": "Lamech and His Two Wives", "work_id": 83}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but298", "title": "Lamech and His Two Wives", "work_id": 84}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but517", "title": "Death on a Pale Horse", "work_id": 85}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt23oct1804", "title": "Letter to William Hayley, 23 October 1804", "work_id": 86}, {"info": null, "composition_date": 1790, "medium": "illbk", "bad_id": "mhh", "title": "The Marriage of Heaven and Hell", "work_id": 87}, {"info": null, "composition_date": 1794, "medium": "illbk", "bad_id": "urizen", "title": "The First Book of Urizen", "work_id": 88}, {"info": null, "composition_date": 1793, "medium": "illbk", "bad_id": "vda", "title": "Visions of the Daughters of Albion", "work_id": 89}, {"info": null, "composition_date": 1796, "medium": "spb", "bad_id": "bb85", "title": "A Large Book of Designs", "work_id": 90}, {"info": null, "composition_date": 1796, "medium": "spb", "bad_id": "bb136", "title": "A Small Book of Designs", "work_id": 91}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but301", "title": "Nebuchadnezzar", "work_id": 92}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but302", "title": "Nebuchadnezzar", "work_id": 93}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but303", "title": "Nebuchadnezzar", "work_id": 94}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but519", "title": "The Great Red Dragon and the Woman Clothed with the Sun", "work_id": 95}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "inscbut519", "title": "The Great Red Dragon and the Woman Clothed with the Sun", "work_id": 96}, {"info": null, "composition_date": 1805, "medium": "rmoth", "bad_id": "inscbut449", "title": "The Devil Rebuked, related materials", "work_id": 97}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but299", "title": "Naomi Entreating Ruth and Orpah to Return to the Land of Moab", "work_id": 98}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but300", "title": "Naomi Entreating Ruth and Orpah to Return to the Land of Moab", "work_id": 99}, {"info": null, "composition_date": 1800, "medium": "paint", "bad_id": "but416", "title": "The Miracle of the Loaves and Fishes", "work_id": 100}, {"info": null, "composition_date": 1806, "medium": "wc", "bad_id": "but613", "title": "Alternative Design for the Title-Page of Robert Blair's 'The Grave': The Resurrection of the Dead", "work_id": 101}, {"info": null, "composition_date": 1806, "medium": "wc", "bad_id": "but616", "title": "Second Alternative Design for Title-Page: A Spirit Rising from the Tomb", "work_id": 102}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt1april1800", "title": "Letter to William Hayley, 1 April 1800", "work_id": 103}, {"info": null, "composition_date": 1804, "medium": "rm", "bad_id": "supplt7aug1804", "title": "Letter to William Hayley, 7 August 1804, supplemental views", "work_id": 104}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt31march1826", "title": "Letter to John Linnell, 31 March 1826", "work_id": 105}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt26nov1800", "title": "Letter to William Hayley, 26 November 1800", "work_id": 106}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt19may1826", "title": "Letter to John Linnell, 19 May 1826", "work_id": 107}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but440", "title": "Finding of Moses", "work_id": 108}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt1aug1826", "title": "Letter to John Linnell, 1 August 1826", "work_id": 109}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but441", "title": "Moses at the Burning Bush", "work_id": 110}, {"info": null, "composition_date": 1803, "medium": "speng", "bad_id": "bbwba14", "title": "Hayley, Life of Romney", "work_id": 111}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt14jan1804", "title": "Letter to William Hayley, 14 January 1804", "work_id": 112}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but442", "title": "Pestilence: Death of the First-Born", "work_id": 113}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but445", "title": "Moses Striking the Rock", "work_id": 114}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but525", "title": "The River of Life", "work_id": 115}, {"info": null, "composition_date": 1801, "medium": "wc", "bad_id": "but447", "title": "Moses Erecting the Brazen Serpent", "work_id": 116}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but446", "title": "The Blasphemer", "work_id": 117}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but449", "title": "The Devil Rebuked", "work_id": 118}, {"info": null, "composition_date": 1816, "medium": "wc", "bad_id": "but544", "title": "Illustrations to Milton's Paradise Regained", "work_id": 119}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but448", "title": "God Writing Upon the Tables of the Covenant", "work_id": 120}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but461", "title": "Job Confessing His Presumption to God Who Answers from the Whirlwind", "work_id": 121}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but394", "title": "Job and His Daughters", "work_id": 122}, {"info": null, "composition_date": 1823, "medium": "penc", "bad_id": "but557", "title": "Sketchbook Containing Drawings for the Engraved Illustrations to The Book of Job", "work_id": 123}, {"info": null, "composition_date": 1821, "medium": "wc", "bad_id": "but551", "title": "Illustrations to the Book of Job", "work_id": 124}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but550", "title": "Illustrations to the Book of Job", "work_id": 125}, {"info": null, "composition_date": 1823, "medium": "spb", "bad_id": "bb421", "title": "Illustrations of the Book of Job", "work_id": 126}, {"info": null, "composition_date": 1788, "medium": "illbk", "bad_id": "aro", "title": "All Religions are One", "work_id": 127}, {"info": null, "composition_date": 1821, "medium": "comb", "bad_id": "bb504", "title": "Pastorals of Virgil", "work_id": 128}, {"info": null, "composition_date": 1820, "medium": "rmb", "bad_id": "relbb504", "title": "Pastorals of Virgil, related materials", "work_id": 129}, {"info": null, "composition_date": 1820, "medium": "mono", "bad_id": "but769", "title": "Drawings for The Pastorals of Virgil", "work_id": 130}, {"info": null, "composition_date": 1803, "medium": "rmoth", "bad_id": "inscbut521", "title": "The Great Red Dragon and the Beast from the Sea: 'And Power Was Given Him Over All Kindreds, and Tongues, and Nations', related materials", "work_id": 131}, {"info": null, "composition_date": 1809, "medium": "comeng", "bad_id": "bb469", "title": "Hayley, The Life of George Romney", "work_id": 132}, {"info": null, "composition_date": 1805, "medium": "rm", "bad_id": "inscbut520", "title": "The Great Red Dragon and the Woman Clothed with the Sun: 'The Devil is Come Down'", "work_id": 133}, {"info": null, "composition_date": 1800, "medium": "comeng", "bad_id": "bb467", "title": "Hayley, An Essay on Sculpture", "work_id": 134}, {"info": null, "composition_date": 1802, "medium": "comb", "bad_id": "bb466", "title": "William Hayley, Designs to Ballads", "work_id": 135}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but289", "title": "Elohim Creating Adam", "work_id": 136}, {"info": null, "composition_date": 1806, "medium": "wc", "bad_id": "but466", "title": "By the Waters of Babylon", "work_id": 137}, {"info": null, "composition_date": 1806, "medium": "rmoth", "bad_id": "inscbut466", "title": "By the Waters of Babylon, related materials", "work_id": 138}, {"info": null, "composition_date": 1803, "medium": "ltr", "bad_id": "lt30jan1803", "title": "Letter to James Blake, 30 January 1803", "work_id": 139}, {"info": null, "composition_date": 1780, "medium": "wc", "bad_id": "but146", "title": "Enoch Walked with God", "work_id": 140}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but463", "title": "Mercy and Truth are Met Together, Righteousness and Peace Have Kissed Each Other", "work_id": 141}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "lt27jan1827", "title": "Letter to John Linnell, 27 January 1827", "work_id": 142}, {"info": null, "composition_date": 1794, "medium": "illbk", "bad_id": "europe", "title": "Europe a Prophecy", "work_id": 143}, {"info": null, "composition_date": 1794, "medium": "ms", "bad_id": "insceurope", "title": "Europe a Prophecy, related materials", "work_id": 144}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt16sept1800", "title": "Letter to William Hayley, 16 September 1800", "work_id": 145}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt29july1826", "title": "Letter to John Linnell, 29 July 1826", "work_id": 146}, {"info": null, "composition_date": 1816, "medium": "ms", "bad_id": "bb69", "title": "Descriptions of 'L'Allegro' and 'Il Penseroso' Designs", "work_id": 147}, {"info": null, "composition_date": 1816, "medium": "wc", "bad_id": "but543", "title": "Illustrations to Milton's L'Allegro and Il Penseroso", "work_id": 148}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but478", "title": "The Parable of the Wise and Foolish Virgins", "work_id": 149}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt14july1826", "title": "Letter to John Linnell, 14 July 1826", "work_id": 150}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but390", "title": "Bathsheba at the Bath", "work_id": 151}, {"info": null, "composition_date": 1803, "medium": "ltr", "bad_id": "lt26oct1803", "title": "Letter to William Hayley, 26 October 1803", "work_id": 152}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but476", "title": "The Third Temptation", "work_id": 153}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but470", "title": "The Presentation in the Temple: 'Simeon Was Not to See Death Before He Had Seen the Christ'", "work_id": 154}, {"info": null, "composition_date": 1801, "medium": "ltr", "bad_id": "lt19oct1801", "title": "Letter to John Flaxman, 19 October 1801", "work_id": 155}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but379", "title": "Eve Tempted by the Serpent", "work_id": 156}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but473", "title": "The Infant Jesus Saying His Prayers: 'And the Grace of God Was Upon Him'", "work_id": 157}, {"info": null, "composition_date": 1814, "medium": "comeng", "bad_id": "bb456", "title": "Flaxman's Hesiod", "work_id": 158}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but488", "title": "Mary Magdalene Washing Christ's Feet", "work_id": 159}, {"info": null, "composition_date": 1800, "medium": "comb", "bad_id": "bb470", "title": "William Hayley, Little Tom the Sailor", "work_id": 160}, {"info": null, "composition_date": 1803, "medium": "comeng", "bad_id": "bb471", "title": "William Hayley, The Triumphs of Temper", "work_id": 161}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "rellt7aug1804", "title": "Letter to William Hayley, 7 August 1804, related materials", "work_id": 162}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but518", "title": "'And the angel which I saw lifted up his hand to Heaven'", "work_id": 163}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt28sept1804", "title": "Letter to William Hayley, 28 September 1804", "work_id": 164}, {"info": null, "composition_date": 1827, "medium": "rm", "bad_id": "supplt3july1827", "title": "Letter to John Linnell, 3 July 1827, supplemental views", "work_id": 165}, {"info": null, "composition_date": 1805, "medium": "ltr", "bad_id": "lt22march1805", "title": "Letter to William Hayley, c. 22 March 1805", "work_id": 166}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but396", "title": "St. Matthew", "work_id": 167}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt27jan1804", "title": "Letter to William Hayley, 27 January 1804", "work_id": 168}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt2april1804", "title": "Letter to William Hayley, 2 April 1804", "work_id": 169}, {"info": null, "composition_date": 1800, "medium": "rm", "bad_id": "supplt1sept1800", "title": "Letter to George Cumberland, 1 September 1800, supplemental views", "work_id": 170}, {"info": null, "composition_date": 1803, "medium": "rmoth", "bad_id": "inscbut499", "title": "Sealing the Stone and Setting a Watch, related materials", "work_id": 171}, {"info": null, "composition_date": 1795, "medium": "illbk", "bad_id": "s-los", "title": "The Song of Los", "work_id": 172}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt28may1804", "title": "Letter to William Hayley, 28 May 1804", "work_id": 173}, {"info": null, "composition_date": 1791, "medium": "comeng", "bad_id": "bb499", "title": "Stedman, Narrative of a Five Years' Expedition", "work_id": 174}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but468", "title": "Ezekiel's Wheels", "work_id": 175}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but306", "title": "Newton", "work_id": 176}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but307", "title": "Newton", "work_id": 177}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but475", "title": "The Baptism of Christ", "work_id": 178}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but462", "title": "David Delivered Out of Many Waters: 'He Rode Upon the Cherubim'", "work_id": 179}, {"info": null, "composition_date": 1822, "medium": "illbk", "bad_id": "abel", "title": "The Ghost of Abel", "work_id": 180}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but467", "title": "The King of Babylon in Hell: 'Hell From Beneath is Moved For Thee'", "work_id": 181}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt5feb1826", "title": "Letter to Mrs. John Linnell, 5 February 1826", "work_id": 182}, {"info": null, "composition_date": 1803, "medium": "rmoth", "bad_id": "inscbut439", "title": "Joseph and Potiphar's Wife, related materials", "work_id": 183}, {"info": null, "composition_date": 1815, "medium": "wc", "bad_id": "but542", "title": "Illustrations to Milton's On the Morning of Christ's Nativity", "work_id": 184}, {"info": null, "composition_date": 1809, "medium": "wc", "bad_id": "but538", "title": "Illustrations to Milton's On the Morning of Christ's Nativity", "work_id": 185}, {"info": null, "composition_date": 1806, "medium": "wc", "bad_id": "but472", "title": "The Repose of the Holy Family in Egypt", "work_id": 186}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but382", "title": "Abraham and Isaac", "work_id": 187}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but381", "title": "Lot and His Daughters", "work_id": 188}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but387", "title": "Moses Indignant at the Golden Calf", "work_id": 189}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but419", "title": "Christ Blessing the Little Children", "work_id": 190}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but439", "title": "Joseph and Potiphar's Wife", "work_id": 191}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but311", "title": "Pity", "work_id": 192}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but313", "title": "Pity", "work_id": 193}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but310", "title": "Pity", "work_id": 194}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but312", "title": "Pity", "work_id": 195}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but485", "title": "Christ Baptizing", "work_id": 196}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt14sept1800", "title": "Letter to Ann Flaxman, wife of John Flaxman, 14 September 1800", "work_id": 197}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but317", "title": "Hecate, or the Night of Enitharmon's Joy", "work_id": 198}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but316", "title": "Hecate, or The Night of Enitharmon's Joy", "work_id": 199}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but318", "title": "Hecate, or The Night of Enitharmon's Joy", "work_id": 200}, {"info": null, "composition_date": 1826, "medium": "ltr", "bad_id": "lt5july1826", "title": "Letter to John Linnell, 5 July 1826", "work_id": 201}, {"info": null, "composition_date": 1804, "medium": "illbk", "bad_id": "milton", "title": "Milton a Poem", "work_id": 202}, {"info": null, "composition_date": 1822, "medium": "illbk", "bad_id": "homer", "title": "On Homers Poetry [and] On Virgil", "work_id": 203}, {"info": null, "composition_date": 1793, "medium": "illbk", "bad_id": "gates-sexes", "title": "For the Sexes: The Gates of Paradise", "work_id": 204}, {"info": null, "composition_date": 1793, "medium": "illbk", "bad_id": "gates-child", "title": "For Children: The Gates of Paradise", "work_id": 205}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but417", "title": "Christ Raising Jairus's Daughter", "work_id": 206}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but415", "title": "The Baptism of Christ", "work_id": 207}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but410", "title": "The Christ Child Asleep on a Cross", "work_id": 208}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but411", "title": "The Christ Child Asleep on a Cross", "work_id": 209}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but496", "title": "Christ Nailed to the Cross: The Third Hour", "work_id": 210}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but497", "title": "The Crucifixion: 'Behold Thy Mother'", "work_id": 211}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but494", "title": "Christ Crucified Between the Two Thieves", "work_id": 212}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "inscbut522", "title": "The Number of the Beast is 666", "work_id": 213}, {"info": null, "composition_date": 1800, "medium": "rmoth", "bad_id": "inscbut524", "title": "'He Cast Him Into the Bottomless Pit, and Shut Him Up', related materials", "work_id": 214}, {"info": null, "composition_date": 1789, "medium": "illbk", "bad_id": "s-inn", "title": "Songs of Innocence", "work_id": 215}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt4dec1804", "title": "Letter to William Hayley, 4 December 1804", "work_id": 216}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but392", "title": "The Judgment of Solomon", "work_id": 217}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but498", "title": "The Entombment", "work_id": 218}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but499", "title": "Sealing the Stone and Setting a Watch", "work_id": 219}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt12march1804", "title": "Letter to William Hayley, 12 March 1804", "work_id": 220}, {"info": null, "composition_date": 1789, "medium": "rm", "bad_id": "suppthel", "title": "The Book of Thel, supplemental views", "work_id": 221}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "lt3july1827", "title": "Letter to John Linnell, 3 July 1827", "work_id": 222}, {"info": null, "composition_date": 1805, "medium": "penc", "bad_id": "but619", "title": "Sketch for Robert Blair's 'The Grave': A Figure Ascending in a Glory of Clouds", "work_id": 223}, {"info": null, "composition_date": 1795, "medium": "illbk", "bad_id": "b-los", "title": "The Book of Los", "work_id": 224}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but495", "title": "The Soldiers Casting Lots for Christ's Garment", "work_id": 225}, {"info": null, "composition_date": 1800, "medium": "comeng", "bad_id": "suppbb467", "title": "Hayley, An Essay on Sculpture, supplemental views", "work_id": 226}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt21sept1800", "title": "Letter to John Flaxman, 21 September 1800", "work_id": 227}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt18feb1800", "title": "Letter to William Hayley, 18 February 1800", "work_id": 228}, {"info": null, "composition_date": 1827, "medium": "rm", "bad_id": "rellt3july1827", "title": "Letter to John Linnell, 3 July 1827, related materials", "work_id": 229}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but324", "title": "The Good and Evil Angels", "work_id": 230}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but323", "title": "The Good and Evil Angels", "work_id": 231}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but325", "title": "Christ Appearing to the Apostles After the Resurrection", "work_id": 232}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but326", "title": "Christ Appearing to the Apostles After the Resurrection", "work_id": 233}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but327", "title": "Christ Appearing to the Apostles After the Resurrection", "work_id": 234}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but320", "title": "The House of Death", "work_id": 235}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but321", "title": "The House of Death", "work_id": 236}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but322", "title": "The House of Death", "work_id": 237}, {"info": null, "composition_date": 1815, "medium": "illbk", "bad_id": "laocoon", "title": "Laocoon", "work_id": 238}, {"info": null, "composition_date": 1800, "medium": "paint", "bad_id": "but409", "title": "Our Lady With the Infant Jesus Riding on a Lamb with St. John", "work_id": 239}, {"info": null, "composition_date": 1806, "medium": "penc", "bad_id": "but614v", "title": "Sketch for Alternative Title-Page for Robert Blair's 'The Grave'", "work_id": 240}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but404", "title": "The Flight Into Egypt", "work_id": 241}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "lt25april1827", "title": "Letter to John Linnell, 25 April 1827", "work_id": 242}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but406", "title": "The Virgin Hushing the Young Baptist", "work_id": 243}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but401", "title": "The Nativity", "work_id": 244}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but486", "title": "The Woman Taken in Adultery", "work_id": 245}, {"info": null, "composition_date": 1799, "medium": "paint", "bad_id": "but403", "title": "The Circumcision", "work_id": 246}, {"info": null, "composition_date": 1788, "medium": "illbk", "bad_id": "nnr", "title": "There is No Natural Religion", "work_id": 247}, {"info": null, "composition_date": 1793, "medium": "rm", "bad_id": "suppvda", "title": "Visions of the Daughters of Albion, copy H, supplemental views", "work_id": 248}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but484", "title": "The Transfiguration", "work_id": 249}, {"info": null, "composition_date": 1815, "medium": "wc", "bad_id": "but528", "title": "Illustrations to Milton's Comus", "work_id": 250}, {"info": null, "composition_date": 1801, "medium": "wc", "bad_id": "but527", "title": "Illustrations to Milton's Comus", "work_id": 251}, {"info": null, "composition_date": 1789, "medium": "illbk", "bad_id": "songsie", "title": "Songs of Innocence and of Experience", "work_id": 252}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but522", "title": "The Number of the Beast is 666", "work_id": 253}, {"info": null, "composition_date": 1809, "medium": "wc", "bad_id": "but523", "title": "The Whore of Babylon", "work_id": 254}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but520", "title": "The Great Red Dragon and the Woman Clothed with the Sun: 'The Devil is Come Down'", "work_id": 255}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but521", "title": "The Great Red Dragon and the Beast from the Sea: 'And Power Was Given Him Over All Kindreds, and Tongues, and Nations'", "work_id": 256}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but489", "title": "Christ in the House of Martha and Mary: 'But Martha Was Cumbered About Much Serving'", "work_id": 257}, {"info": null, "composition_date": 1800, "medium": "wc", "bad_id": "but524", "title": "'He Cast Him Into the Bottomless Pit, and Shut Him Up'", "work_id": 258}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt7aug1804", "title": "Letter to William Hayley, 7 August 1804", "work_id": 259}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but291", "title": "Satan Exulting Over Eve", "work_id": 260}, {"info": null, "composition_date": 1795, "medium": "cprint", "bad_id": "but292", "title": "Satan Exulting Over Eve", "work_id": 261}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but469", "title": "Satan in His Original Glory: 'Thou Wast Perfect Till Iniquity Was Found in Thee'", "work_id": 262}, {"info": null, "composition_date": 1795, "medium": "illbk", "bad_id": "ahania", "title": "The Book of Ahania", "work_id": 263}, {"info": null, "composition_date": 1793, "medium": "rmoth", "bad_id": "relamerica", "title": "America a Prophecy related works", "work_id": 264}, {"info": null, "composition_date": 1804, "medium": "rm", "bad_id": "supplt11oct1825", "title": "Letter to Mary Ann Linnell, wife of John Linnell, 11 October 1825, supplemental views", "work_id": 265}, {"info": null, "composition_date": 1825, "medium": "ltr", "bad_id": "lt11oct1825", "title": "Letter to Mary Ann Linnell, wife of John Linnell, 11 October 1825", "work_id": 266}, {"info": null, "composition_date": 1805, "medium": "ltr", "bad_id": "lt22jan1805", "title": "Letter to William Hayley, 22 January 1805", "work_id": 267}, {"info": null, "composition_date": 1793, "medium": "illbk", "bad_id": "america", "title": "America a Prophecy", "work_id": 268}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "lt15march1827", "title": "Letter to John Linnell, 15 March 1827", "work_id": 269}, {"info": null, "composition_date": 1797, "medium": "wc", "bad_id": "but335", "title": "Illustrations to Gray's Poems", "work_id": 270}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but438", "title": "Jacob's Dream", "work_id": 271}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but511", "title": "The Death of St. Joseph", "work_id": 272}, {"info": null, "composition_date": 1827, "medium": "ltr", "bad_id": "lt15aug1827", "title": "Letter from George Richmond to Samuel Palmer, 15 August 1827", "work_id": 273}, {"info": null, "composition_date": 1803, "medium": "comeng", "bad_id": "bb468", "title": "Hayley, The Life, and Posthumous Writings, of William Cowper", "work_id": 274}, {"info": null, "composition_date": 1800, "medium": "ltr", "bad_id": "lt1sept1800", "title": "Letter to George Cumberland, 1 September 1800", "work_id": 275}, {"info": null, "composition_date": 1803, "medium": "wc", "bad_id": "but436", "title": "Angel of the Divine Presence Clothing Adam and Eve", "work_id": 276}, {"info": null, "composition_date": 1805, "medium": "wc", "bad_id": "but635", "title": "Death Pursuing the Soul Through the Avenues of Life", "work_id": 277}, {"info": null, "composition_date": 1804, "medium": "ltr", "bad_id": "lt23feb1804", "title": "Letter to William Hayley, 23 February 1804", "work_id": 278}, {"info": null, "composition_date": 1807, "medium": "ms", "bad_id": "bb126", "title": "The Pickering Manuscript", "work_id": 279}, {"info": null, "composition_date": 1805, "medium": "comb", "bad_id": "bb465", "title": "William Hayley, Ballads ... Relating to Animals", "work_id": 280}, {"info": null, "composition_date": 1821, "medium": "ms", "bad_id": "bb125", "title": "The Order in which the Songs of Innocence & of Experience ought to be paged & placed", "work_id": 281}];
}]);

angular.module('blake').controller("HomeController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("WorkController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("ObjectController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("CompareController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("SearchController", function ($scope, BlakeDataService) {
    $scope.search = function () {
        BlakeDataService.query($scope.searchConfig).then(function (results) {
            $scope.results = results;
        });

    };

    $scope.showWorks = true;
    $scope.showCopies = true;
    $scope.showObjects = true;
});
