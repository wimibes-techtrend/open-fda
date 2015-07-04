function paramSerializer(params) {
	var arr = [];
	for (var name in params) {
		arr.push(name + '=' + params[name]);
	}
	return arr.join('&');
}
/*
	To find medications, use the following count query:
	https://api.fda.gov/drug/event.json?api_key=LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU
		&search=patient.drug.medicinalproduct:cetirizine
		&count=patient.drug.medicinalproduct.exact
*/
<<<<<<< HEAD
angular.module('medInfoApp', [])
	.service('Events', function() {
		var API_KEY: 'LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU';

		this.fetch = function(filters, countField, limit) {
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

					/**
					angular.forEach(data.results, function(result) {
						capitalized = result.term.substring(0, 1).toUpperCase() + result.term.substring(1).toLowerCase();
						medList.meds.push({term: capitalized, count: result.count});
					});
					*/
				}).
				error(function(data, status) {
					$scope.data = data || "Request failed";
					$scope.status = status;
			});
		};


	})
	.controller('MedsearchController', ['$scope', '$http', '$templateCache', '$filter',
		function($scope, $http, $templateCache, $filter) {
			var search;
			var medSearch = this;
			var dateFilter = $filter('date');
=======
angular.module('medInfoApp', []).controller('MedsearchController', ['$scope', '$http', '$templateCache',
		function($scope, $http, $templateCache) {
			var medList = this;
>>>>>>> origin

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
					filters.push({ field: $scope.medicationField, value: $scope.medicationName });
				}
				if ($scope.filterAdministrationRoute) {
					filters.push({ field: 'patient.drug.drugadministrationroute', value: $scope.administrationRoute });
				}
				if ($scope.filterDosage) {
					filters.push({ field: 'patient.drug.drugcumulativedosageunit', value: $scope.dosageUnit });
					filters.push({ field: 'patient.drug.drugcumulativedosagenumb', value:  });
				}
				if ($scope.filterSince) {
<<<<<<< HEAD
					filters.push({ field: 'receivedate', value: createDateRange(dateFilter, new Date($scope.since), new Date()) });
				}
				if ($scope.filterSeverity) {
					filters.push({ field: 'serious', value: $scope.severity });
				}

			}
=======
					filters.push({ field: , value:  });
				}

				return;

				var requestConfig = {
					method: $scope.method
					, url: $scope.url
					, params: {
							search: '(patient.drug.openfda.generic_name:' + text + ')'
							, count: 'patient.drug.openfda.generic_name'
							, limit: 100
							, api_key: 'LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU'
					}
					, cache: $templateCache
				}

				$scope.code = null;
				$scope.response = null;

				medList.meds = [];

				try {
					$scope.requesturl = $scope.url + '?' + paramSerializer(requestConfig.params);
				} catch (e) {
					alert('oops: ' + e.message);
				}

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

>>>>>>> origin
		}
	])
	.controller('EventListController', ['$scope', '$http', '$templateCache',
		function($scope, $http, $templateCache) {
			
		}
	])
;


