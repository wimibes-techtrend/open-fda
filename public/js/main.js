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
	.value('DRUG_API_URL', 'https://api.fda.gov/drug/event.json')
	.value('API_KEY', 'LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU')
	.service('EventService', ['$http', '$templateCache', 'DRUG_API_URL', 'API_KEY', function($http, $templateCache, drugApiUrl, apiKey) {
		var _this = this;
		var events = [ { term: 'Wim Ibes', count: 2034 } ];
		var criteria = [];

		// Impl
		this.data = '<n/a>';
		this.status = '<n/a>';
		this.requestUrl = drugApiUrl;
		this.events = events;
		this.clear = function() {
			_this.events = [];
			_this.criteria = [];
		};
		this.addCriterion = function(field, value, quoted) {
			var values;
			var criterion;

			if (criteria.hasOwnProperty(field)) {
				criterion = criteria[field];
				criterion.values.push(value);
			} else {
				criterion = { values: [ value ], quoted: ((quoted) ? true : false) };
				criteria[field] = criterion;
			}
		};
		this.fetch = function(groupField, limit) {
			var searching;
			var search;
			var values;
			var criterion;
			var searchFields = [];
			var countBy = (groupField) ? groupField : 'patient.reaction.reactionmeddrapt.exact';

			for (var field in criteria) {
				if (criteria.hasOwnProperty(field)) {
					criterion = criteria[field];
					values = criterion.values.join(' ');
					if (criterion.quoted) {
						values = '"' + values + '"';
					}
					searchFields.push('(' + field + ':' + values + ')');
				}
			}
			search = searchFields.join(' AND ');

			var requestConfig = {
				method: 'GET'
				, url: drugApiUrl
				, params: {
						search: search
						, count: countBy
						, limit: limit
						, api_key: apiKey
				}
				, cache: $templateCache
			}

			_this.requestUrl = drugApiUrl + '?' + paramSerializer(requestConfig.params);

			searching = $http(requestConfig);
			searching.success(function(data, status, config) {
				var capitalized;

				_this.data = data;
				_this.status = status;

				angular.forEach(data.results, function(result) {
					capitalized = result.term.substring(0, 1).toUpperCase() + result.term.substring(1).toLowerCase();
					_this.events.push({ term: capitalized, count: result.count });
				});
			})
			searching.error(function(data, status) {
				_this.data = data || "Request failed";
				_this.status = status;
			});

			return searching;
		};
	}])
	.controller('MedsearchController', ['$scope', '$filter', 'EventService',
		function($scope, $filter, EventService) {
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
				var searching;
				var searchResults;
				var criteria = [];

				EventService.clear();

				if ($scope.filterMedicationName) {
					EventService.addCriterion($scope.medicationField, $scope.medicationName, true);
				}
				if ($scope.filterAdministrationRoute) {
					EventService.addCriterion('patient.drug.drugadministrationroute', $scope.administrationRoute);
				}
				if ($scope.filterDosage) {
					EventService.addCriterion('patient.drug.drugcumulativedosageunit', $scope.dosageUnit);
					EventService.addCriterion('patient.drug.drugcumulativedosagenumb', createNumberRange($scope.dosageFrom, $scope.dosageTo));
				}
				if ($scope.filterSince) {
					EventService.addCriterion('receivedate', createDateRange(dateFilter, new Date($scope.since), new Date()));
				}
				if ($scope.filterSeverity) {
					EventService.addCriterion('serious', $scope.severity);
				}

				// Perform the search
				EventService.fetch('patient.reaction.reactionmeddrapt.exact', 100);
			}
		}
	])
	.controller('EventListController', ['$scope', '$filter', 'EventService',
		function($scope, $filter, EventService) {
			$scope.EventService = EventService;
		}
	])

