define(["qlik", "jquery", "./candlestick-properties", "text!./candlestick.css"],
function(qlik, $, properties, cssContent) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	return {
		initialProperties : {
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 5,
					qHeight : 1000
				}]
			}
		},
		definition : properties,
		support : {
			snapshot: true,
			export: true,
			exportData : true
		},
		paint : function($element, layout) {

			if(layout.qHyperCube.qDimensionInfo.length < 5){

				var $firstMessage = $("#firstMessage");
				if(!$firstMessage.length){
					var message = "<div id='firstMessage' style='font-size:1.5em;'>";
					message += "<h1>Dimension:</h1>"
					message += "Add a <b>Date</b> field as Dimension<br><br>";
					message += "<h1>Prices:</h1>";
					message += "Add the following dimensions in order<br>";
					message += "1. High Value<br>";
					message += "2. Low Value<br>";
					message += "3. Open Value<br>";
					message += "4. Close Value<br>";
					message += "</div>";
					$element.append(message);
				}
				return;
			}
			console.log(layout.qHyperCube);
			
			var self = this;
			//var measures = layout.qHyperCube.qMeasureInfo;
			var dimensions = layout.qHyperCube.qDimensionInfo;
			var dimName = dimensions[0].qFallbackTitle;
			var qData = layout.qHyperCube.qDataPages[0];
			var numDataPoints = qData.qMatrix.length;
			
			//Define the canvas dimensions
			var chartxOffset = 50;
			var chartyOffset = 80;
			var canvasWidth;
			
			if($element.width()/numDataPoints < 30){
				canvasWidth = 20 * numDataPoints + chartxOffset;
			}
			else {
				canvasWidth = $element.width()*0.99;
			}

			var canvasHeight = $element.height()*0.98;
			
			var cssWidth = "100%";
			if(layout.cs.legendSetting == true){
				cssWidth = "92%";
				canvasWidth = 0.92*canvasWidth;
			}
			var chartWidth = canvasWidth - chartxOffset ;
			var chartHeight = canvasHeight - chartyOffset ;
			var dataWidth = chartWidth/numDataPoints;				// Width for single data point

			//x is the xcoordinate of mid point for the first data value area
			var x = dataWidth/2;
			var barWidth = dataWidth*0.6;
			var maxValue = dimensions[1].qMax*1.02; 		// Get Max value of High Value
			var minValue = dimensions[2].qMin*0.99; 		// Get Min value of High Value
			var factor =chartHeight/(maxValue-minValue);

			var html = "<div class='tooltip'><span class='tooltiptext'></span></div>";	
			html += "<div id='chartContainer'><canvas id='canvas'  width="+canvasWidth+" height="+canvasHeight+" ></canvas></div>";
			html += "<div id='yaxis'><canvas id='yaxisCanvas' width=" + chartxOffset + " height=" + canvasHeight  + "></canvas></div>";
			
			if(layout.cs.legendSetting == true){
				html += "<div id='legend'>";
				html += "<table>";
				html += "<caption><b>Measures</b></caption>";
				//Hide the 'High-Low average' legend if not shown 
				if(layout.cs.hideHLLine == false){
					html += "<tr>";
					html += "<td>";
					html += "<svg height='10' width='20'><line x1='0' y1='5' x2='20' y2='5' style='stroke:" + layout.cs.HLColor + "';stroke-width:2' /></svg>";
					html += "</td>";
					html += "<td>HL Avg.</td>";
					html += "</tr>";
				}
				//Hide the 'Open-Close Average' legend if not shown 
				if(layout.cs.hideOCLine == false){
					html += "<tr>";
					html += "<td>";
					html += "<svg height='10' width='20'><line x1='0' y1='5' x2='20' y2='5' style='stroke:" + layout.cs.OCColor + "';stroke-width:2' /></svg>";
					html += "</td>";
					html += "<td>OC Avg.</td>";
					html += "</tr>";
				}
				html += "<tr>";
				html += "<td>";
				html += "<svg height='20' width='20'><rect width='20' height='20' style='fill:" + layout.cs.increaseColor + ";stroke-width:2;stroke:" + layout.cs.borderColor + "' /></svg>";
				html += "</td>";
				html += "<td>Bullish</td>";
				html += "</tr>";
				html += "<tr>";
				html += "<td>"
				html += "<svg height='20' width='20'><rect width='20' height='20' style='fill:" + layout.cs.decreaseColor + ";stroke-width:2;stroke:" + layout.cs.borderColor + "' /></svg>";
				html += "</td>";
				html += "<td>Bearish</td>";
				html += "</tr></table>";
				html += "</div>";
			}
			
			html += "<div id='xaxisLabel'>" + dimName + "</div>";
			$element.html(html);

			$("#chartContainer").css("width", cssWidth);
			$("#legend").css("width", "8%");
			
			//Draw on the Y-axis canvas (remains stable when chart is scrolled)
			var yaxisCanvas = document.getElementById("yaxisCanvas").getContext("2d");
			yaxisCanvas.fillStyle = 'white';
			yaxisCanvas.fillRect(0, 0, 50, chartHeight);
			yaxisCanvas.strokeStyle = "white";
			
			//Draw a white triangle to hide the x-axis values behind y-axis when scrolling
			// Change the fillstyle above to 'black' to see the triangle
			yaxisCanvas.moveTo(50, chartHeight);
			yaxisCanvas.lineTo(0, chartHeight + 60);
			yaxisCanvas.lineTo(0, chartHeight);
			yaxisCanvas.lineTo(50, chartHeight);
			yaxisCanvas.fill();
			//yaxisCanvas.stroke();

			//Translate the Origin to the lower right corner of the canvas
			yaxisCanvas.translate(chartxOffset, chartHeight);
			
			/*
				Start drawing the y-axis canvas
			*/
			yaxisCanvas.beginPath();
			yaxisCanvas.strokeStyle = "#aaa";
			yaxisCanvas.fillStyle = "#777";
			yaxisCanvas.textAlign = "right";
			yaxisCanvas.font = "12px Arial";

			//Draw a y-axis line
			yaxisCanvas.moveTo(0, 0);				//Rememeber we have translated
			yaxisCanvas.lineTo(0, -chartHeight);   // -chartHeight because we are drawing downward to upwards

			//Start drawing the numbers and reference markings 
			yaxisCanvas.textBaseline = "bottom";
			yaxisCanvas.moveTo(-10, 0);
			yaxisCanvas.lineTo(0, 0);
			yaxisCanvas.fillText(Math.round(minValue), -15, 0);

			//Draw three more lines
			yaxisCanvas.textBaseline = "middle";
			for(var i=1; i<4; i++){
				yaxisCanvas.moveTo(-10, -i*chartHeight/4);
				yaxisCanvas.lineTo(0, -i*chartHeight/4);
				yaxisCanvas.fillText(Math.round(minValue + i*(maxValue-minValue)/4), -15, -i*chartHeight/4);
			}

			//Draw the topmost margin
			yaxisCanvas.textBaseline = "top";
			yaxisCanvas.moveTo(-10, -chartHeight);
			yaxisCanvas.lineTo(0, -chartHeight);
			yaxisCanvas.fillText(Math.round(minValue + (maxValue-minValue)), -15, -chartHeight);

			yaxisCanvas.stroke();
			yaxisCanvas.closePath();
			
			//Start Drawing
			var canvas = document.getElementById("canvas");
			var ctx = canvas.getContext("2d");  
			ctx.translate(chartxOffset, chartHeight);
			
			ctx.strokeStyle = "#aaa";
			//Draw the margins (4)
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			ctx.font = "12px Arial";
			ctx.fillStyle = "#777";

			for(var i=0; i<5; i++){
				ctx.moveTo(0, -i*chartHeight/4);
				ctx.lineTo(chartWidth, -i*chartHeight/4);
				//ctx.fillText(Math.round(minValue + i*(maxValue-minValue)/4), -15, -i*chartHeight/4);
			}
			ctx.stroke();
			var data = [], obj;
			if(qData && qData.qMatrix) {
				qData.qMatrix.forEach(function(row) {
					if(row.length > 1){
						var dim  = row[0], high = row[1].qNum, low = row[2].qNum, open = row[3].qNum, close = row[4].qNum;
						var yLow = Math.round((low-minValue)*factor);
						var yHigh = Math.round((high-minValue)*factor);
						var yOpen = Math.round((open-minValue)*factor);
						var yClose = Math.round((close-minValue)*factor);
						var HLAvg = (high + low)/2;			// Average of High and Low for a day
						var OCAvg = (open + close)/2;		// Average of Open and Close for a day
						var yHLAvg = (yLow + yHigh)/2;		// Average of High and Low for a day (in px)
						var yOCAvg = (yOpen + yClose)/2;	// Average of Open and Close for a day (in px)
						var x1 = x-barWidth/2;
						var x2 = x+barWidth/2;
						
						obj = {
							"yLow"	: yLow, 
							"yHigh"	: yHigh, 
							"xpos"	: x, 
							"x1"	: x1, 
							"x2"	: x2, 
							"dim"	: dim.qText, 
							"high"	: high, 
							"low"	: low, 
							"open"	: open, 
							"close"	: close,
							"HLAvg"	: HLAvg,
							"OCAvg"	: OCAvg,
							"yHLAvg": yHLAvg,
							"yOCAvg": yOCAvg
						};
						data.push(obj);
						
						if(dim.qIsOtherCell) {
							dim.qText = layout.qHyperCube.qDimensionInfo[0].othersLabel;
						}
					}
					if(dim.qElemNumber !== -1) {
						ctx.beginPath();
						ctx.strokeStyle = layout.cs.borderColor;
						ctx.lineWidth = layout.cs.stickWidth;
						ctx.moveTo(Math.round(x), -yLow);
						ctx.lineTo(Math.round(x), -yHigh);
						ctx.stroke();
						ctx.fillStyle = "#333";
						ctx.textAlign = "right";
						ctx.font = "12px Arial";
						ctx.translate(x, 10)
						ctx.rotate(-Math.PI/4);
						ctx.fillText(dim.qText, 0, 0);
						ctx.rotate(Math.PI/4);
						ctx.translate(-x, -10);
						
						if(open >= close){
							ctx.strokeStyle = layout.cs.borderColor;
							ctx.fillStyle = layout.cs.decreaseColor;
							ctx.strokeRect(Math.round(x-barWidth/2), -yOpen, Math.round(barWidth), (yOpen-yClose));
							ctx.fillRect(Math.round(x-barWidth/2), -yOpen, Math.round(barWidth), (yOpen-yClose));
						}
						else {
							ctx.strokeStyle = layout.cs.borderColor;
							ctx.fillStyle = layout.cs.increaseColor;
							ctx.strokeRect(Math.round(x-barWidth/2), -yClose, Math.round(barWidth), (yClose-yOpen));
							ctx.fillRect(Math.round(x-barWidth/2), -yClose, Math.round(barWidth), (yClose-yOpen));
						}
						ctx.closePath();
					}
					x = x + dataWidth;
				});
			}
			
			
			ctx.lineWidth = layout.cs.lineWidth;

			//Draw the High-Low average if it is not hidden by user
			if(!layout.cs.hideHLLine){
				ctx.beginPath();
				ctx.strokeStyle = layout.cs.HLColor;
				ctx.moveTo((data[0].xpos), -data[0].yHLAvg);
				for(var i = 1; i < data.length; i++){
					ctx.lineTo((data[i].xpos), -data[i].yHLAvg);
				}
				ctx.stroke();

			}
			

			// Draw the Open-Close Average if it is not hidden by user
			if(!layout.cs.hideOCLine){
				ctx.beginPath();
				ctx.strokeStyle = layout.cs.OCColor;
				ctx.moveTo(data[0].xpos, -data[0].yOCAvg);
				for(var i = 1; i < data.length; i++){
					ctx.lineTo(data[i].xpos, -data[i].yOCAvg);
				}
				ctx.stroke();
			}
			
			//Draw the legend


			//Find the scroll position in x direction
			var scrollOffsetX = 0; 
			var $extensionContainer = $("#chartContainer");
			$extensionContainer.scroll(function(){
				scrollOffsetX = $extensionContainer.scrollLeft();
			});
			
			// request mousemove events
			$("#canvas").mousemove(function(e){handleMouseMove(e);});
			var offset = $("#canvas").offset();
			
			function handleMouseMove(e){
				var mouseX=parseInt(e.clientX - offset.left - chartxOffset + scrollOffsetX);
				var mouseY=parseInt(e.clientY - offset.top);
				
				$(".tooltiptext").css('visibility', 'hidden');
				$(".tooltiptext").css('font-size','12px');
				
				data.forEach(function(row){
					if(row.x2-row.x1 > mouseX-row.x1 && mouseX > row.x1 && mouseY > chartHeight-row.yHigh && mouseY < chartHeight-row.yLow){
						$(".tooltip").css('left', row.xpos + chartxOffset - scrollOffsetX);
						$(".tooltip").css('top', chartHeight - row.yHigh);
						$(".tooltiptext").css('visibility', 'visible');
						$(".tooltiptext").html(row.dim+"<br><table><tr><td>Open: " + row.open + "</td><td>High: " + row.high + "</td></tr><tr><td>Close: " + row.close + "</td><td>Low: " + row.low + "</td></tr><tr><td><svg width='10' height='10'><rect width='10' height='10' style='fill:" + layout.cs.OCColor + "' /></svg>&nbsp;Avg: " + row.OCAvg.toFixed(2) + "</td><td><svg width='10' height='10'><rect width='10' height='10' style='fill:" + layout.cs.HLColor + "' /></svg>&nbsp;Avg: " + row.HLAvg.toFixed(2) + "</td></tr><table>");
						
					}
				});
			}

			return qlik.Promise.resolve();
		}
	};
});
