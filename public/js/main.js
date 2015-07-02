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
angular.module('medInfoApp', []).controller('MedsearchController', ['$scope', '$http', '$templateCache',
		function($scope, $http, $templateCache) {
			var medList = this;

			$scope.method = 'GET';
			$scope.url = 'https://api.fda.gov/drug/event.json';
			
			$scope.keywords = 'ibuprofen';

			medList.meds = [];

			$scope.fetch = function() {
				var text = $scope.keywords;
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

		}
	])
	.controller('EventtypeController', ['$scope', '$http', '$templateCache',
		function($scope, $http, $templateCache) {
			
		}
	]);


