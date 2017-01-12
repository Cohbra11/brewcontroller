var updateTable = function(){
var fs = require('fs');
var self = this;
	
	var tableName;
	var temp;
	var timespan;
	var numRows = 0;
	var tempArray = [];
	var setpointArray = [];
	var timeArray = [];
	var timeSpan = [];
	var obj = {};
	var new_json;
	var setpoint = 0;
	var queryString;
	var mysql = require('./connect-mysql.js').pool;
	var tabelNameBuffer;
	var setPointBuffer;
	var timeSpanBuffer;
	
	self.getResults = function(updateControlId, newWriteTableData){
// If the timespan for the chart has changed...
		if(newWriteTableData != null){
			tabelNameBuffer = newWriteTableData.tableName;
			setPointBuffer = newWriteTableData.setPoint;
			timeSpanBuffer = newWriteTableData.timeSpan;
			newWriteTableData = null;
		}

		mysql.getConnection(function(err, connection){
		if(((tabelNameBuffer == ("control"+updateControlId+"_temp")) && (timeSpanBuffer != null))){
		    switch(updateControlId) {
	        	case 0: 
	        		timespan = timeSpanBuffer;
	        		timeSpanBuffer = null;
	        		break;
		        case 1: 
	        		timespan = timeSpanBuffer;
	        		timeSpanBuffer = null;
		        	break;
	    		default: return; //
			}			
		} else {
        	queryString = "SELECT timespan FROM control"+updateControlId+"_temp ORDER BY id DESC LIMIT 1;";
			connection.query(queryString,  function(err, rows){
	  			if(err)	{
	  				throw err;
		    	}else{
	        		timespan = rows[0].timespan;
		    	}
			});
		}
		if(((tabelNameBuffer == ("control"+updateControlId+"_temp")) && (setPointBuffer != null))){
		    switch(updateControlId) {
	        	case 0: // enter
	        		setpoint = setPointBuffer;
	        		setPointBuffer = null;
	        		break;
		        case 1: // left
	        		setpoint = setPointBuffer;
	        		setPointBuffer = null;
		        	break;
	    		default: return; //
			}			
		} else {
        	queryString = "SELECT setpoint FROM control"+updateControlId+"_temp ORDER BY id DESC LIMIT 1;";
			connection.query(queryString,  function(err, rows){
	  			if(err)	{
	  				throw err;
		    	}else{
	        		setpoint = rows[0].setpoint;
		    	}
			});
		}
		tableName = 'control'+updateControlId+'_temp';


	    //--------------Generate a random number for testing to simulate a temperature reading 
		temp = (Math.floor(Math.random() * (1000 - 995 + 1)) + 995)/10;
		exports.temp = temp;
		// console.log("tableName: "+tableName);
		// console.log("setpoint: "+setpoint);
		// console.log("timeSpanBuffer: "+timeSpanBuffer);

			queryString = "SELECT temp FROM "+tableName+" ORDER BY id ASC;";
			connection.query(queryString,  function(err, rows){
			  	numRows = rows.length;
				if(err)	{
			  		throw err;
			  	}else if(numRows < timespan) {
					queryString = "REPLACE INTO "+tableName+" (timestamp, temp, setpoint, timespan) VALUES (NOW(),"+temp+","+setpoint+","+timespan+")";
					connection.query(queryString,  function(err, rows){
				  		if(err)	{
				  			throw err;
					    }else{
					      
					    }
					});
				}else if(numRows >= timespan){
					var rowsToDelete = numRows - timespan;
					queryString = "DELETE FROM "+tableName+" WHERE id IS NOT NULL order by id asc LIMIT "+rowsToDelete;
					connection.query(queryString,  function(err, rows){
			  			if(err)	{
			  				throw err;
				    	}
					});
					queryString = "REPLACE INTO "+tableName+" (timestamp, temp, setpoint, timespan) VALUES (NOW(),"+temp+","+setpoint+","+timespan+")";
					connection.query(queryString,  function(err, rows){
			  			if(err)	{
			  				throw err;
				    	}
					});
		    	}
			});
			queryString = "SELECT * FROM "+tableName+" ORDER BY id asc;";
			connection.query(queryString,  function(err, rows){
	  			if(err)	{
	  				throw err;
		    	}else{
		    		var i;
	    		    for (i in rows) {
	        			tempArray[i] = rows[i].temp;
	        			setpointArray[i] = rows[i].setpoint;
	        			timeArray[i] = rows[i].timestamp;
	        			timeSpan[i] = rows[i].timespan;
    				}
					obj = {"temp": tempArray,
						"setpoint": setpointArray,
						"time": timeArray,
						"count": rows.length,
						"timeSpan": timeSpan[i]
					};
					new_json = JSON.stringify(obj);
		    	}
				fs.writeFileSync('client/jsonFiles/'+tableName+'.json', new_json, 'utf8', function(){
				});
			});
		    connection.release();
		});
	};
};
module.exports = updateTable;