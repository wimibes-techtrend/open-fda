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
		
		$scope.keywords = 'ibuprofin';

		medList.meds = [ {term: 'ibuprofin', count: 100}
			, {term: 'tylenol', count: 70}
		];
		medList.meds = [];

		$scope.fetch = function() {
			var text = $scope.keywords;

			var requestConfig = {
				method: $scope.method
				, url: $scope.url
				, params: {
						api_key: 'LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU'
						, search: '(patient.drug.medicinalproduct:"' + text + '") AND serious:1'
						, count: 'patient.drug.medicinalproduct.exact'
						, limit: 100
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

	}]);

