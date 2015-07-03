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
		return '[' + dstring1  + ' TO ' + dstring2 + ']';
	} else {
		return '[' + dstring2  + ' TO ' + dstring1 + ']';
	}
}
function createNumberRange(num1, num2) {
	if (num1 < num2) {
		return '[' + num1  + ' TO ' + num2 + ']';
	} else {
		return '[' + num2  + ' TO ' + num1 + ']';
	}
}
/*
	To find medications, use the following count query:
	https://api.fda.gov/drug/event.json?api_key=LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU
		&search=patient.drug.medicinalproduct:cetirizine
		&count=patient.drug.medicinalproduct.exact
*/
angular.module('medInfoApp', []).controller('MedsearchController', ['$scope', '$http', '$templateCache', '$filter',
		function($scope, $http, $templateCache, $filter) {
			var search;
			var medList = this;
			var dateFilter = $filter('date');

			$scope.method = 'GET';
			$scope.url = 'https://api.fda.gov/drug/event.json';
			
			$scope.keywords = 'ibuprofen';

			medList.meds = [];

			$scope.fetch = function() {
				var text = $scope.keywords;
				var filters = [];

				if ($scope.filterMedicationName) {
					filters.push({ field: $scope.medicationField, value: '"' + $scope.medicationName + '"' });
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
					filters.push({ field: 'receivedate', value: createDateRange(dateFilter, new Date(since), new Date()) });
				}

				search = [];
				for (var filter in filters) {
					if (filters.hasOwnProperty(filter)) {
						filter = filters[filter];
						search.push('(' + filter.field + ':' + filter.value + ')');
					}
				}
				search = search.join(' AND ');

				//$scope.resultCopy = search;

				var requestConfig = {
					method: $scope.method
					, url: $scope.url
					, params: {
							search: search
							, count: 'patient.drug.openfda.generic_name'
							, limit: 100
							, api_key: 'LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU'
					}
					, cache: $templateCache
				}

				$scope.code = null;
				$scope.response = null;

				medList.meds = [];

				$scope.requesturl = $scope.url + '?' + paramSerializer(requestConfig.params);

				$http(requestConfig).
					success(function(data, status) {
						$scope.results = data.results.length;

						$scope.status = status;
						$scope.data = data;

						angular.forEach(data.results, function(result) {
							medList.meds.push({term: result.term, count: result.count});
						});
					}).
					error(function(data, status) {
						$scope.data = data || "Request failed";
						$scope.status = status;
				});
			};

		}
	])
	.controller('EventtypeController', ['$scope', '$http', '$templateCache',
		function($scope, $http, $templateCache) {
			
		}
	]);


