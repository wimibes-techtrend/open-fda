angular.module('medInfoApp', ['ui.bootstrap']);
angular.module('medInfoApp').controller('MedsearchController', function ($scope) {
	
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
  
  $scope.selected = undefined;
  $scope.states = ['Oral','Auricular (otic)','Buccal','Cutaneous','Dental','Endocervical','Endosinusial','Endotracheal','Epidural','Extra-amniotic','Hemodialysis','Intra corpus cavernosum','Intra-amniotic','Intra-arterial','Intra-articular','Intra-uterine','Intracardiac','Intracavernous','Intracerebral','Intracervical','Intracisternal','Intracorneal','Intracoronary','Intradermal','Intradiscal (intraspinal)','Intrahepatic','Intralesional','Intralymphatic','Intramedullar (bone marrow)','Intrameningeal','Intramuscular','Intraocular','Intrapericardial','Intraperitoneal','Intrapleural','Intrasynovial','Intratumor','Intrathecal','Intrathoracic','Intratracheal','Intravenous bolus','Intravenous drip','Intravenous (not otherwise specified)','Intravesical','Iontophoresis','Nasal','Occlusive dressing technique','Ophthalmic','Oropharingeal','Other','Parenteral','Periarticular','Perineural','Rectal','Respiratory (inhalation)','Retrobulbar','Sunconjunctival','Subcutaneous','Subdermal','Sublingual','Topical','Transdermal','Transmammary','Transplacental','Unknown','Urethral','Vaginal'];
  
});
