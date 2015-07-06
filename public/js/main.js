function paramSerializer(params) {
	var arr = [];
	for (var name in params) {
		arr.push(name + '=' + params[name]);
	}
	return arr.join('&');
}
function createDateRange(dateFilter, date1, date2) {
	var dstring1 = dateFilter(date1, 'yyyyMMdd');
	var dstring2 = dateFilter(date2, 'yyyyMMdd');

	if (date1.getTime() < date2.getTime()) {
		return '[' + dstring1 + ' TO ' + dstring2 + ']';
	} else {
		return '[' + dstring2 + ' TO ' + dstring1 + ']';
	}
}
function createNumberRange(num1, num2) {
	if (num1 < num2) {
		return '[' + num1 + ' TO ' + num2 + ']';
	} else {
		return '[' + num2 + ' TO ' + num1 + ']';
	}
}
/*
	To find medications, use the following count query:
	https://api.fda.gov/drug/event.json?api_key=LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU
		&search=patient.drug.medicinalproduct:cetirizine
		&count=patient.drug.medicinalproduct.exact
*/
angular.module('medInfoApp', [])
	.value('API_KEY', 'LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU')
	.service('EventService', function() {
		var _this = this;
		var events = [ { term: 'Wim Ibes', count: 2034 } ];

		_this.events = events;

		// Could plug in a client-side database on events here ...
	})
	.factory('searchDrugEvents', ['$http', '$templateCache', 'API_KEY', function($http, $templateCache, apiKey) {
		var method = 'GET';
		var url = 'https://api.fda.gov/drug/event.json';

		return function(criteria, countField, limit) {
			var search;
			var searchFields = [];

			for (var criterion in criteria) {
				if (criteria.hasOwnProperty(criterion)) {
					criterion = criteria[criterion];
					searchFields.push('(' + criterion.field + ':' + criterion.value + ')');
				}
			}
			search = searchFields.join(' AND ');

			var requestConfig = {
				method: method
				, url: url
				, params: {
						search: search
						, count: countField // 'patient.reaction.reactionmeddrapt.exact'
						, limit: limit
						, api_key: apiKey
				}
				, cache: $templateCache
			}

			return $http(requestConfig);
		};
	}])
	.controller('MedsearchController', ['$scope', '$filter', 'searchDrugEvents', 'EventService',
		function($scope, $filter, searchDrugEvents, EventService) {
			var search;
			var medSearch = this;
			var dateFilter = $filter('date');

			$scope.EventService = EventService;

			////// Some initialization /////
			$scope.medicationName = 'Advil';
			$scope.medicationField = 'patient.drug.medicinalproduct';
			$scope.administrationRoute = '048'
			$scope.since = '01/31/2014';
			$scope.dosageUnit = '003';
			$scope.severity = 1;
			///////////////////////////////

			medSearch.fetch = function() {
				var doSearch;
				var searchResults;
				var criteria = [];

				EventService.events =  [];

				if ($scope.filterMedicationName) {
					criteria.push({ field: $scope.medicationField, value: '"' + $scope.medicationName + '"' });
				}
				if ($scope.filterAdministrationRoute) {
					criteria.push({ field: 'patient.drug.drugadministrationroute', value: $scope.administrationRoute });
				}
				if ($scope.filterDosage) {
					criteria.push({ field: 'patient.drug.drugcumulativedosageunit', value: $scope.dosageUnit });
					criteria.push({ field: 'patient.drug.drugcumulativedosagenumb'
						, value: createNumberRange($scope.dosageFrom, $scope.dosageTo) });
				}
				if ($scope.filterSince) {
					criteria.push({ field: 'receivedate', value: createDateRange(dateFilter, new Date($scope.since), new Date()) });
				}
				if ($scope.filterSeverity) {
					criteria.push({ field: 'serious', value: $scope.severity });
				}

				$scope.code = null;
				$scope.response = null;

				// Perform the search
				doSearch = searchDrugEvents(criteria, 'patient.reaction.reactionmeddrapt.exact', 100);

				doSearch.success(function(data, status) {
					var capitalized;

					$scope.results = data.results.length;

					$scope.status = status;
					$scope.data = data;

					angular.forEach(data.results, function(result) {
						capitalized = result.term.substring(0, 1).toUpperCase() + result.term.substring(1).toLowerCase();
						EventService.events.push({ term: capitalized, count: result.count });
					});
				});

				doSearch.error(function(data, status) {
					$scope.data = data || "Request failed";
					$scope.status = status;
				});
			}
		}
	])
	.controller('EventListController', ['$scope', '$filter', 'EventService',
		function($scope, $filter, EventService) {
			$scope.EventService = EventService;
		}
	])














