const _ = require('lodash');

const register = function (server, options, next) {

  const hstore = server.plugins['store']['api'];

  const sNames = [
    'hoodie',
    'hoodie-store',
    'data',
    '.hoodie',
    '_users',
    'hack',
    'store',
    'api',
    'userzkjjij4'
  ];

  console.log("checking if stores exist");

  Promise.all(
    sNames.map((sName) => hstore.exists(sName))
  ).then(function (sNamesStats) {
    _.zip(sNames, sNamesStats).forEach(_.spread(function (sName, sStat) {
      if (sStat) {
        console.log(sName + " exists");
      } else {
        console.log(sName + " doesn't exist");
      }
    }));
  }).then(function () {
    return hstore.open('hack');
  }).then(function (store) {
    console.log("open ok");
    return store.findAll();
  }, function (err) {
    console.log("open failed");
    console.log(err);
    next();
  }).then(function (docs) {
    console.log("got docs");
    console.log(docs);
    next();
  }, function (err) {
    console.log("get docs failed");
    console.log(err);
    next();
  });



  server.route({
    method: 'GET',
    path: '/api',
    handler: function (request, reply) {
      reply('Hello, world!');
    }
  });

  // next();

}

var exports = {};

exports.register = register;
exports.register.attributes = {
  name: 'hoodie-app-plugin'
};

module.exports = exports;
