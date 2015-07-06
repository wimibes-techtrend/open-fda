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
	.factory('openfdaDrugService', ['$http', function($http, API_KEY) {
		var fetch = function(filters, countField, limit) {
			var search = [];

			search = [];
			for (var filter in filters) {
				if (filters.hasOwnProperty(filter)) {
					filter = filters[filter];
					search.push('(' + filter.field + ':' + filter.value + ')');
				}
			}
			search = search.join(' AND ');

			var requestConfig = {
				method: $scope.method
				, url: $scope.url
				, params: {
						search: search
						, count: countField // 'patient.reaction.reactionmeddrapt.exact'
						, limit: limit
						, api_key: API_KEY
				}
				, cache: $templateCache
			}

			$scope.code = null;
			$scope.response = null;

			$scope.requesturl = $scope.url + '?' + paramSerializer(requestConfig.params);

			$http(requestConfig).
				success(function(data, status) {
					var capitalized;
					$scope.results = data.results.length;

					$scope.status = status;
					$scope.data = data;
				}).
				error(function(data, status) {
					$scope.data = data || "Request failed";
					$scope.status = status;
			});
		};
	})


					/**
					angular.forEach(data.results, function(result) {
						capitalized = result.term.substring(0, 1).toUpperCase() + result.term.substring(1).toLowerCase();
						medList.meds.push({term: capitalized, count: result.count});
					});
					*/

	.controller('MedsearchController', ['$scope', '$http', '$templateCache', '$filter',
		function($scope, $http, $templateCache, $filter) {
			var search;
			var medSearch = this;
			var dateFilter = $filter('date');

			$scope.method = 'GET';
			$scope.url = 'https://api.fda.gov/drug/event.json';
			
			$scope.keywords = 'ibuprofen';

			////// Some initialization /////
			$scope.medicationName = 'Advil';
			$scope.medicationField = 'patient.drug.medicinalproduct';
			$scope.administrationRoute = '048'
			$scope.since = '01/31/2014';
			$scope.dosageUnit = '003';
			$scope.severity = 1;
			///////////////////////////////
			
			function fetch() {
			var filters = [];

				if ($scope.filterMedicationName) {
					filters.push({ field: $scope.medicationField, value: '"' + $scope.medicationField + '"' });
				}
				if ($scope.filterAdministrationRoute) {
					filters.push({ field: 'patient.drug.drugadministrationroute', value: $scope.administrationRoute });
				}
				if ($scope.filterDosage) {
					filters.push({ field: 'patient.drug.drugcumulativedosageunit', value: $scope.dosageUnit });
					filters.push({ field: 'patient.drug.drugcumulativedosagenumb'
						, value: createNumberRange($scope.dosageFrom, $scope.dosageTo) });
				}
				if ($scope.filterSince) {
					filters.push({ field: 'receivedate', value: createDateRange(dateFilter, new Date($scope.since), new Date()) });
				}
				if ($scope.filterSeverity) {
					filters.push({ field: 'serious', value: $scope.severity });
				}

			}
		}
	])
	.controller('EventListController', ['$scope', '$http', '$templateCache',
		function($scope, $http, $templateCache) {
			
		}
	])
