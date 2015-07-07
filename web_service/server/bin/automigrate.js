var path = require('path');
var app = require(path.resolve(__dirname, '../server'));

var patients = [
  {
    firstname: 'Joe',
    lastname: 'Doe',
    email: 'joe@doe.com',
    age: '32',
    gender: 'male',
    druglist: ['Asperin', 'Ketoconazone'],
    createdAt: new Date(),
    lastModifiedAt: new Date()
  },
  {
    firstname: 'Baz',
    lastname: 'Qux',
    email: 'baz@qux.com',
    age: '8',
    gender: 'female',
    druglist: ['Vatamin D'],
    createdAt: new Date(),
    lastModifiedAt: new Date()
  }
];
var dataSource = app.dataSources.patientDS;

dataSource.automigrate('Patient', function(err) {
  if (err) console.log(err);

  var Patient = app.models.Patient;
  var count = patients.length;

  patients.forEach(function(patient) {
    Patient.create(patient, function(err, record) {
      if (err) return console.log(err);

      console.log('Record created:', record);

      count--;

      if (count === 0) {
        console.log('done');
        dataSource.disconnect();
      }
    });
  });
});
