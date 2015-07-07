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
angular.module('medInfoApp', ['googlechart'])
	.value('DRUG_API_URL', 'https://api.fda.gov/drug/event.json')
	.value('API_KEY', 'LZgWcrkV7bemrG9i8sKDE8GbWWAUbbOzIRTIOuxU')
	.service('EventService', ['$http', '$templateCache', 'DRUG_API_URL', 'API_KEY', function($http, $templateCache, drugApiUrl, apiKey) {
		var _this = this;
		var events = [ { term: 'Wim Ibes', count: 2034 } ];
		var _criteria = [];
		var _watchers = [];

		// Impl
		this.data = '<n/a>';
		this.status = '<n/a>';
		this.requestUrl = drugApiUrl;
		this.events = events;
		this.clear = function() {
			_this.events = [];
			_criteria = [];
		};
		this.addCriterion = function(field, value, quoted) {
			var values;
			var criterion;

			if (_criteria.hasOwnProperty(field)) {
				criterion = _criteria[field];
				criterion.values.push(value);
			} else {
				criterion = { values: [ value ], quoted: ((quoted) ? true : false) };
				_criteria[field] = criterion;
			}
		};
		this.onChange = function(fn) {
			_watchers.push(fn);
		};
		this.fetch = function(groupField, limit) {
			var searching;
			var search;
			var values;
			var criterion;
			var searchFields = [];
			var countBy = (groupField) ? groupField : 'patient.reaction.reactionmeddrapt.exact';

			for (var field in _criteria) {
				if (_criteria.hasOwnProperty(field)) {
					criterion = _criteria[field];
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

				for (var i = 0; i < _watchers.length; i++) {
					try {
						_watchers[i](_this);
					} catch (e) {
						// log(e)
					}
				}
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
			
			///Start UI ///
			$scope.today = function() {
			    $scope.dt = new Date();
			  };
			  $scope.today();

			  $scope.clear = function () {
			    $scope.dt = null;
			  };

			  // Disable weekend selection
			  $scope.disabled = function(date, mode) {
			    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
			  };
			/*
			  $scope.toggleMin = function() {
			    $scope.minDate = $scope.minDate ? null : new Date();
			  };
			  $scope.toggleMin();
			*/
			  $scope.open = function($event) {
			    $event.preventDefault();
			    $event.stopPropagation();

			    $scope.opened = true;
			  };

			  $scope.dateOptions = {
			    formatYear: 'yy',
			    startingDay: 1
			  };

			  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			  $scope.format = $scope.formats[0];

			  var tomorrow = new Date();
			  tomorrow.setDate(tomorrow.getDate() + 1);
			  var afterTomorrow = new Date();
			  afterTomorrow.setDate(tomorrow.getDate() + 2);
			  $scope.events =
			    [
			      {
			        date: tomorrow,
			        status: 'full'
			      },
			      {
			        date: afterTomorrow,
			        status: 'partially'
			      }
			    ];

			  $scope.getDayClass = function(date, mode) {
			    if (mode === 'day') {
			      var dayToCheck = new Date(date).setHours(0,0,0,0);

			      for (var i=0;i<$scope.events.length;i++){
			        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

			        if (dayToCheck === currentDay) {
			          return $scope.events[i].status;
			        }
			      }
			    }

			    return '';
			  };
			  
			  $scope.administrationRoute = undefined;
			  $scope.states = ['Oral','Auricular (otic)','Buccal','Cutaneous','Dental','Endocervical','Endosinusial',
			                   'Endotracheal','Epidural','Extra-amniotic','Hemodialysis','Intra corpus cavernosum',
			                   'Intra-amniotic','Intra-arterial','Intra-articular','Intra-uterine','Intracardiac',
			                   'Intracavernous','Intracerebral','Intracervical','Intracisternal','Intracorneal',
			                   'Intracoronary','Intradermal','Intradiscal (intraspinal)','Intrahepatic','Intralesional',
			                   'Intralymphatic','Intramedullar (bone marrow)','Intrameningeal','Intramuscular',
			                   'Intraocular','Intrapericardial','Intraperitoneal','Intrapleural','Intrasynovial',
			                   'Intratumor','Intrathecal','Intrathoracic','Intratracheal','Intravenous bolus',
			                   'Intravenous drip','Intravenous (not otherwise specified)','Intravesical','Iontophoresis',
			                   'Nasal','Occlusive dressing technique','Ophthalmic','Oropharingeal','Other','Parenteral',
			                   'Periarticular','Perineural','Rectal','Respiratory (inhalation)','Retrobulbar',
			                   'Sunconjunctival','Subcutaneous','Subdermal','Sublingual','Topical','Transdermal',
			                   'Transmammary','Transplacental','Unknown','Urethral','Vaginal'];
			///End UI///

			////// Some initialization /////
			$scope.medicationName = '';
			$scope.medicationField = 'patient.drug.medicinalproduct';
			$scope.administrationRoute = 'Oral';
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
				EventService.fetch('patient.reaction.reactionmeddrapt.exact', 10);
			}
		}
	])
	.controller('EventListController', ['$scope', '$filter', 'EventService',
		function($scope, $filter, EventService) {
			var chartRows;

			$scope.displayMode = 'none';

			EventService.onChange(function() {
				var events = EventService.events;
				var rows = [];

				$scope.displayMode = 'block';

				for (var i = 0; i < events.length; i++) {
					var event = events[i];
					rows.push({ c: [
						{ v: event.term },
						{ v: event.count },
					]});
				}

				$scope.chart = {
					type: "ColumnChart",
					cssStyle: "height:50ex",
					data: {
						cols: [
							{ id: "reaction", label: "Reaction", type: "string", p: {} }
							, { id: "laptop-id", label: "Incidents", type: "number", p: {} }
						]
						, rows: rows
					},
					options: {
						title: "Top 10 Incidents by Reaction",
						isStacked: false,
						fill: 80,
						displayExactValues: true,
						vAxis: {
							title: "Number of Incidents",
							gridlines: {
								count: 6
							}
						},
						hAxis: {
							title: "Reaction symptoms"
						}
					},
					formatters: {},
					displayed: true
				}
			});

			$scope.EventService = EventService;
		}
	])





















