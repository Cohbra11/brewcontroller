var mysql = require("mysql");
	// First you need to create a connection to the db
	var pool = mysql.createPool({
	  database: "brewcontroller",
	  host: "localhost",
	  user: "root",
	  password: "brewcontroller"
	});
exports.pool = pool;
