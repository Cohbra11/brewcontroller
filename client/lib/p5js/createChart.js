
var MYLIBRARY = MYLIBRARY || (function(){
    var _args = {}; // private

    return {
        init : function(Args) {
            _args = Args;
            // some other initialising
        },
        createChart : function() {
            var chartID = _args[0];
			var chartSize = _args[1];
			var chartName = _args[2];

			var Chart = function(chart) {
				var numDataPoints;
				var datapointY = [];
				var setpoint = [];
				var dataPointTime = [];
				var timespan;
				var chartHeight;
				var chartWidth;
				var chartMax;
				var chartMin;
				var chartRange;
				var padTop;
				var padBottom;
				var padLeft;
				var padRight;
				var pxPerDegree;
				var pxPerTime;
				var windowWidth;
				var windowHeight;
				var horizGrids;
				var vertGrids;
				var minorHorizGrid;
				var minorVertGrid;
				var url;
				var setX;
				var setY;
				var currentSetPoint;
				var enableTempChange = false;
				var hoverTemp = false;
				var lastChartSize;
				
		  	chart.setup = function() {
		  	  	var canvas = chart.createCanvas(chartSize, chartSize*.66);
				url = 'jsonFiles/control'+chartID+'_temp.json';
		  	  	canvas.parent('chart'+chartID);
		  	  	chart.frameRate(1);
		  	    chart.ellipseMode(chart.CENTER);
				padTop = .025*chart.width;
				padBottom = .1*chart.width;
				padLeft = .15*chart.width;
				padRight = .1*chart.width;
				};
				
		  	chart.draw = function() {
		  		chartSize = document.getElementById(chartName).offsetWidth;
		  		if(chartSize != lastChartSize){
		  			lastChartSize = chartSize;
		  			chart.resizeCanvas(chartSize, chartSize*.66);
					padTop = .025*chart.width;
					padBottom = .1*chart.width;
					padLeft = .15*chart.width;
					padRight = .1*chart.width;
				}
			    chart.loadJSON(url, parseData);
			    chart.calculate();
			  	chart.background(0);
		  		chart.horizontalGrid();
		  		chart.verticalGrid();
		  		chart.renderGraph();
		  		chart.checkHoverTemp();
		  	};
		  	
		  	chart.mousePressed = function(){
				if(hoverTemp == true){
		  			document.getElementById(chartName+'tableName').value = 'control'+chartID+'_temp';
					enableTempChange = true;
					createInputs();
				}
		  	};
		  	
		  	function incrSetPoint(){
		  		currentSetPoint = chart.round((currentSetPoint + 0.1)*10)/10;
				document.getElementById(chartName+'form').inputBox.value = currentSetPoint;
		  	}
		  	
		  	function decrSetPoint(){
		  		currentSetPoint = chart.round((currentSetPoint - 0.1)*10)/10;
				document.getElementById(chartName+'form').inputBox.value = currentSetPoint;
		  	}
			
			function writeSetpoint(){
				enableTempChange = false;
				hoverTemp = false;
			}
		
		  	function createInputs() {
		    	if(document.getElementById('myDiv')){
					document.getElementById('chart0panel').style="display:none";
					document.getElementById('chart1panel').style="display:none";
		    		document.getElementById('myDiv').remove();
		    	}
	    		if (enableTempChange == true && !document.getElementById('myDiv')){
		  			hoverTemp = false;
					document.getElementById(chartName+'panel').style="display:block";
		  			var myDiv = chart.createDiv("Temperature Setpoint");
		  			myDiv.id("myDiv");
		  			myDiv.parent(chartName+'form');
					currentSetPoint = setpoint[numDataPoints-1];
					
					var upButton = chart.createButton('▲');
					upButton.parent('myDiv');
					upButton.id('upButton');
					upButton.value('0');
					upButton.position(chart.width/2, (chart.height/2)-30);
					upButton.mousePressed(incrSetPoint);
					document.getElementById('upButton').className="btn btn-default btn-block";
					document.getElementById('upButton').type = "button";
					document.getElementById('upButton').style = "width:50%";
					document.getElementById('upButton').style = "height:30px";
					
					var input = chart.createInput(currentSetPoint);
					input.parent('myDiv');
					input.id('inputBox');
					input.position(chart.width/2, chart.height/2);
					document.getElementById('inputBox').className="col-md-3 form-control";
					document.getElementById('inputBox').type = "number";
					document.getElementById('inputBox').min = 0;
					document.getElementById('inputBox').max = 250;
					document.getElementById('inputBox').step = 0.1;
					document.getElementById('inputBox').value = currentSetPoint;
					document.getElementById('inputBox').focus();
					document.getElementById('inputBox').style = "max-width:50%";
					document.getElementById('inputBox').style = "height:24px";
					document.getElementById('inputBox').style = "text-align: center";
		
					var downButton = chart.createButton('▼');
					downButton.parent('myDiv');
					downButton.id('downButton');
					downButton.value('0');
					downButton.position(chart.width/2, (chart.height/2)+30);
					downButton.mousePressed(decrSetPoint);
					document.getElementById('downButton').className="btn btn-default btn-block";
					document.getElementById('downButton').type = "button";
					document.getElementById('downButton').style = "width:50%";
					document.getElementById('downButton').style = "height:30px";
					
					var enterButton = chart.createButton("Enter");
					enterButton.parent('myDiv');
					enterButton.id('enterButton');
					enterButton.position(chart.width/2+75, chart.height/2);
					enterButton.mousePressed(writeSetpoint);
					document.getElementById('enterButton').className="btn btn-default btn-block";
					document.getElementById('enterButton').type = "submit";
					document.getElementById('enterButton').value = "Send";
					document.getElementById('enterButton').style = "width:50%";
					document.getElementById('enterButton').style = "height:30px";
		  		}
		  	}
		  	
		
		  	chart.checkHoverTemp = function(){
		  		var distance = chart.dist(chart.mouseX, chart.mouseY, setX, setY);
		  		if (distance < 50){
		  			hoverTemp = true;
		  		}else{
		  			hoverTemp = false;
		  		}
		  	};
		  	
		  	function parseData(data){
		  		chartMax = 0;
		  		chartMin = 1000;
		  		var startTime;
		  		var x;
			  	for (x = 0; x < data.count; x++){
			  		if(x==0){
			  			startTime = data.time[x];
			  		}
			  		datapointY[x] = data.temp[x];
			  	    setpoint[x] = data.setpoint[x];
			  	    dataPointTime[x] = data.time[x];
			  	    
			  	    if (datapointY[x]>chartMax){
			  	    	chartMax = datapointY[x];
			  	    }
			  	    if (datapointY[x]<chartMin){
			  	    	chartMin = datapointY[x];
			  	    }
			  	    if (setpoint[x] <0 || setpoint[x]==null){
			  	    	setpoint[x] = 0;
			  	    }
		  		}
		  		
		  //		var endTime = dataPointTime[data.count-1];
				// endTime = new Date(endTime.replace(' ', 'T')).getTime();
				// startTime = new Date(startTime.replace(' ', 'T')).getTime();
				timespan = data.count-1;
				document.getElementById(chartName+"timeSpan").value = data.count-1;
		  		numDataPoints = data.count;
				if(chartMin < 0){
		  			chartMin = 0;
		  		}
		  	}
		  	
		  	chart.calculate = function(){
		  		chartMax = Math.ceil(((chartMax+5))/5)*5;
		  		chartMin = Math.floor(((chartMin-5))/5)*5;
		  		if (chartMin < 0){
		  			chartMin = 0;
		  		}
			  	chartRange = chartMax - chartMin;
		  		windowWidth = chart.width;
		  		windowHeight = chart.height;
		  		chartWidth = windowWidth-padLeft-padRight;
		  		chartHeight = windowHeight-padTop-padBottom;
			  	chartRange = chartMax - chartMin;
			  	pxPerDegree = chartHeight/chartRange;
			  	pxPerTime = chartWidth/(numDataPoints-1);
		  	};
			  		  	
		  	chart.renderGraph = function() {
			  	chart.stroke(100);
			  	chart.fill(255,50);
		  		chart.textSize(chart.height/10);
			  	for (var k = 0; k < numDataPoints-1; k++) {
		  			var setpointToUse = setpoint[k];
		  			var setpointToUse2 = setpoint[k+1];
					if (setpointToUse<chartMin){
						setpointToUse = chartMin;
					}  
					if (setpointToUse>chartMax){
						setpointToUse = chartMax;
					}  
					if (setpointToUse2<chartMin){
						setpointToUse2 = chartMin;
					}  
					if (setpointToUse2>chartMax){
						setpointToUse2 = chartMax;
					}  
		
			  		var x1 = (k*pxPerTime)+padLeft;
			  		var x2 = ((k+1)*pxPerTime)+padLeft;
			  		var y1 = windowHeight-padBottom-(datapointY[k]*pxPerDegree)+(chartMin*pxPerDegree);
			  		var y2 = windowHeight-padBottom-(datapointY[k+1]*pxPerDegree)+(chartMin*pxPerDegree);
			  		var setPointy1 = windowHeight-padBottom-(setpointToUse*pxPerDegree)+(chartMin*pxPerDegree);
			  		var setPointy2 = windowHeight-padBottom-(setpointToUse2*pxPerDegree)+(chartMin*pxPerDegree);
			    	chart.line(x1, y1, x2, y2);//draw the temperature line
			    	chart.ellipse(x2, y2, 2, 2);
				    if (hoverTemp == true){
			    		chart.stroke(255,216,0);
			    		chart.strokeWeight(4);
				    }else{
			    		chart.stroke(255,61,163);
			    		chart.strokeWeight(1);
				    }
				    chart.line(x1, setPointy1, x2, setPointy2);//draw the setpoint line
			    	chart.stroke(100);
			    	chart.strokeWeight(1);
			  	}
			    chart.fill(255,0,0);
				chart.ellipse(x2, y2, 10, 10);
				chart.textAlign(chart.RIGHT, chart.CENTER);
				chart.text(datapointY[k]+"°", x2-5, y2);
				//draw temp setpoint triangle
			    var tX1 = windowWidth-padRight ;
			    var tY1 = windowHeight-padBottom-(setpointToUse*pxPerDegree)+(chartMin*pxPerDegree);
			    setX = tX1+15;
			    setY = tY1;
			    var tX2 = windowWidth-padRight+10;
			    var tY2 = tY1-5;
			    var tX3 = windowWidth-padRight+10;
			    var tY3 = tY1+5;
			    if (hoverTemp == true){
		    		chart.fill(255,216,0);
			    	chart.textSize(chart.height/15);
			    }else{
		    		chart.fill(255,61,163);
			    	chart.textSize(chart.height/25);
			    }
			    chart.textAlign(chart.LEFT, chart.CENTER);
			    chart.text(setpoint[k]+"°", setX, setY);
			    chart.triangle(tX1, tY1, tX2, tY2, tX3, tY3);	  	    	
		  	};
			  	
		  	chart.horizontalGrid = function() {
		  		horizGrids = 10;
		  		minorHorizGrid = 1;
		  		var majorGridSpacing = chartHeight/horizGrids;
		  		var tempVal;
		  		for(var g = 0; g <= horizGrids; g++) {
		  			chart.stroke(30);
		  			chart.line(padLeft-3, (majorGridSpacing*g)+padTop, chartWidth+padLeft, (majorGridSpacing*g)+padTop);
		  	    chart.fill(255,0,0);
			  		chart.textSize(chart.height/25);
			  		chart.textAlign(chart.RIGHT, chart.CENTER);
			  		tempVal = (chartMax-(g*(chartRange/horizGrids)));
		 				chart.text((tempVal+"°"), padLeft - 2, ((chartHeight/horizGrids)*g)+padTop);
						chart.textSize(chart.height/15);
						chart.textAlign(chart.LEFT, chart.CENTER);
						chart.text("°F", 3, windowHeight/2);
		 				if (minorHorizGrid == 1 && g < horizGrids){
		 					chart.stroke(15);
							chart.line(padLeft-1, (majorGridSpacing*g)+padTop+(majorGridSpacing/2), chartWidth+padLeft, (majorGridSpacing*g)+padTop+(majorGridSpacing/2));
		 				}
		  		}
		  	};
			  	
		  	chart.verticalGrid = function() {
		  		vertGrids = 10;
		  		minorVertGrid = 1;
		  		var majorGridSpacing = chartWidth/vertGrids;
		  		for(var t = 0; t <= vertGrids; t++){
		  			var timeVal = ((timespan/vertGrids)*t);
		  			timeVal = Math.round(timeVal);
		  			chart.stroke(30);
		  			chart.line(windowWidth-padRight-(majorGridSpacing*t), padTop+chartHeight+3 , windowWidth-padRight-(majorGridSpacing*t), padTop);
			    	chart.fill(255,216,0);
		  			chart.stroke(30);
		   			chart.textSize(chart.height/25);
		   			chart.textAlign(chart.CENTER, chart.TOP);
		   			chart.text(timeVal, windowWidth-padRight-(majorGridSpacing*t), padTop+chartHeight+3);
		  			chart.textSize(chart.height/15);
		  			chart.textAlign(chart.CENTER, chart.BOTTOM);
		  			chart.text("Seconds", windowWidth/2, windowHeight-2);
		   			if (minorVertGrid == 1 && t < vertGrids){
		   				chart.stroke(15);
		  				chart.line(windowWidth-padRight-(majorGridSpacing*t)-(majorGridSpacing/2), padTop+chartHeight+3, windowWidth-padRight-(majorGridSpacing*t)-(majorGridSpacing/2), padTop);
		   			}
		  		}
		  	};
			};
			new p5(Chart, document.getElementById(chartName));
		}
    };
}());