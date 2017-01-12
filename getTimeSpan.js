var updateTable = function(){
var self = this;
	
	var timeSpan;
	var queryString;
	var mysql = require('./connect-mysql.js').pool;
	
	self.getResults = function(socket, getTimeSpanTable){
// If the timespan for the chart has changed...
		mysql.getConnection(function(err, connection){
	    	queryString = "SELECT timespan FROM "+getTimeSpanTable+" ORDER BY id DESC LIMIT 1;";
			connection.query(queryString,  function(err, rows){
	  			if(err)	{
	  				throw err;
		    	}else{
	        		timeSpan = rows[0].timespan;
					socket.emit("timespan", timeSpan);
		    	}
			});
		    getTimeSpanTable = null;
		});
	};
};
module.exports = updateTable;