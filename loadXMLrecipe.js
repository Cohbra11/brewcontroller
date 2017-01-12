var newRecipe = function(){
	var self = this;

	self.getResults = function(socket, recipeFileName){
	
		var fs = require('fs'),
		    xml2js = require('xml2js');

		var parser = new xml2js.Parser();
		fs.readFile('./recipes/' + recipeFileName, function(err, data) {
		    parser.parseString(data, function (err, result) {
				socket.emit("recipe", result.RECIPES.RECIPE[0]);
		    });
		});

	};
};
module.exports = newRecipe;