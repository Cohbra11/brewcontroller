//
// # SimpleServer
//

var $ = require('jquery');
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var fs = require('fs');

// var p5js = require('./libraries/p5.js');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];
var updateControlId = 0;
var numControls = 2;
var recipeFileName;
var getChartTimeSpan;
var newWriteTableData = {};

io.on('connection', function (socket) {
    console.log("Connected");
    sockets.push(socket);
    
    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('newTableData', function (writeTableData) {
      newWriteTableData = writeTableData;
    });

    socket.on('heartbeat', function (heartBeatID) {
      var newheartBeatID = heartBeatID + 1;
      socket.emit("heartbeat", newheartBeatID);
    });

    socket.on('getTimeSpan', function (getTimespan) {
      getChartTimeSpan = String(getTimespan);
      getTimeSpan(socket, getChartTimeSpan);
    });
    
    socket.on('recipe', function (recipe) {
        recipeFileName = String(recipe);
        console.log(recipeFileName);
        var recipeFile = require('./loadXMLrecipe.js');
        var changeActiveRecipe = new recipeFile();
        changeActiveRecipe.getResults(socket, recipeFileName);
        recipeFileName = null;
    });
        
  });
server.listen(process.env.PORT || 2337, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Brew Controller server listening at", addr.address + ":" + addr.port);
});

setInterval(function() {
    var updateTable = require('./updateTable.js');
    var updateTableInstance = new updateTable();
    var newTableData = {};
    try{
      if(newWriteTableData.tableName == ("control"+updateControlId+"_temp")){
        newTableData = newWriteTableData;
        newWriteTableData = null;
      }
    }
    catch (err){}
    updateTableInstance.getResults(updateControlId, newTableData);
    if (updateControlId < numControls-1){
        updateControlId++;
    }else{
        updateControlId = 0;
    }
}, 500);

//Load the list of recipes that are saved on the server
var files = fs.readdirSync('./recipes/');
var obj = {};
var new_json;
obj = {"recipe": files};
new_json = JSON.stringify(obj);
fs.writeFileSync('client/jsonFiles/recipes.json', new_json, 'utf8', function(){
});

function getTimeSpan(socket, getChartTimeSpan) {
    var gettimespan = require('./getTimeSpan.js');
    var gettimespanInstance = new gettimespan();
    gettimespanInstance.getResults(socket, getChartTimeSpan);
    getChartTimeSpan = null;
}

