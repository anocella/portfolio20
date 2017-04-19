

function drawCorrelations(dataUrl) {
    //var dataUrl = "http://localhost:5000/corr?startDate=01/02/1991&endDate=01/02/2010"
    d3.csv(dataUrl, function(error, rows) {
      var data = [];

          var tip = d3.tip()
	  	  .attr('class', 'd3-tip')
	  	  .offset([-10, 0])
	  	  .html(function(d) {
	  	    return d.x + " / " + d.y + "<br>" + d.value.toFixed(2);
    })

      rows.forEach(function(d) {
        var x = d[" "];
        delete d[" "];
        for (prop in d) {
          var y = prop,
            value = d[prop];
          data.push({
            x: x,
            y: y,
            value: +value
          });
        }
      });

	  var margin = {
		  top: 40,
		  right: 100,
		  bottom: 40,
		  left: 40
		},
		width = 1920 * 0.60 - margin.left - margin.right,
		height = 1080 * 0.60 - margin.top - margin.bottom,
		domain = d3.set(data.map(function(d) {
		  return d.x
		})).values(),
		num = Math.sqrt(data.length),
		color = d3.scale.linear()
		  .domain([-1, 0, 1])
		  .range([d3.hsl(240, .8, .5), d3.hsl(120, .5, .5), d3.hsl(0, .8, .5)]);

	  var x = d3.scale
		.ordinal()
		.rangePoints([0, width])
		.domain(domain),
	  y = d3.scale
		.ordinal()
		.rangePoints([0, height])
		.domain(domain),
	  xSpace = x.range()[1] - x.range()[0],
	    ySpace = y.range()[1] - y.range()[0];

	  d3.select("#chart").select("#corrChart").remove();

      var svg = d3.select("#chart")
        .append("svg")
        .attr("id", "corrChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.call(tip);

      svg.append("text").attr("x",0).attr("y",-25).attr("text-anchor", "start").text(document.getElementById("sd").value + " - " + document.getElementById("ed").value)
      svg.append("text")
        .attr("x",200)
        .attr("y",-25)
        .attr("font-size", "10px")
        .attr("text-anchor", "start")
        .attr("font-weight", "normal")
        .attr("font-family", "sans-serif")
        .text("Circle size measures correlation magnitude. Circle color changes with sign: positive correlations are progressively red, and negative correlations are progressively blue.")

      var cor = svg.selectAll(".cor")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "cor")
        .attr("transform", function(d) {
          return "translate(" + x(d.x) + "," + y(d.y) + ")";
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      cor.append("rect")
        .attr("width", xSpace)
        .attr("height", ySpace)
        .attr("x", -xSpace / 2)
        .attr("y", -ySpace / 2);

      cor.filter(function(d){
          var ypos = domain.indexOf(d.y);
          var xpos = domain.indexOf(d.x);
          for (var i = (ypos + 1); i < num; i++){
            if (i === xpos) return false;
          }
          return true;
        })
        .append("text")
        .attr("y", 5)
        .text(function(d) {
          if (d.x === d.y) {
            return d.x;
          } else {
            return d.value.toFixed(2);
          }
        })
        .style("font", function(d){
          if (d.value === 1) {
            return "10px sans-serif"
          }
        })
        .transition()
        .style("fill", function(d){
          if (d.value === 1) {
            return "#000";
          } else {
            return color(d.value);
          }
        })
        .duration(1500)
		.style("font-weight", function(d){
		  if (d.value === 1) {
			return "bold"
		  }
        });

        cor.filter(function(d){
          var ypos = domain.indexOf(d.y);
          var xpos = domain.indexOf(d.x);
          for (var i = (ypos + 1); i < num; i++){
            if (i === xpos) return true;
          }
          return false;
        })
        .append("circle")
        .attr("r", 0)
        .transition()
        .attr("r", function(d){
          return (width / (num * 4)) * (Math.abs(d.value) + 0.1);
        })
        .style("fill", function(d){
          if (d.value === 1) {
            return "#000";
          } else {
            return color(d.value);
          }
        })
        .duration(1500);

    var aS = d3.scale
      .linear()
      .range([-margin.top + 15, height + margin.bottom - 15])
      .domain([1, -1]);

    var yA = d3.svg.axis()
      .orient("right")
      .scale(aS)
      .tickPadding(7);

    var aG = svg.append("g")
      .attr("class", "y axis")
      .call(yA)
      .attr("transform", "translate(" + (width + margin.right / 2) + " ,0)")

    var iR = d3.range(-1, 1.01, 0.01);
    var h = height / iR.length + 3;
    iR.forEach(function(d){
        aG.append('rect')
          .style('fill',color(d))
          .style('stroke-width', 0)
          .style('stoke', 'none')
          .attr('height', h)
          .attr('width', 10)
          .attr('x', 0)
          .attr('y', aS(d))
      });
    });
}


function drawRisk(dataUrl) {
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1920 * 0.50 - margin.left - margin.right,
    height = 1080 * 0.50 - margin.top - margin.bottom;

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function(d) { return d.std;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d.mean;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.category;},
    color = d3.scale.category10();

d3.select("#riskChart").select("#riskyChart").remove();

// add the graph canvas to the body of the webpage
var svg = d3.select("#riskChart").append("svg")
	.attr("id", "riskyChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
//var tooltip = d3.select("body").append("div")
//    .attr("class", "tooltip");

          var tooltip = d3.tip()
	  	  .attr('class', 'd3-tip')
	  	  .offset([-10, 0])
	  	  .html(function (d) {return d.asset + "<br/>Return: " + yValue(d).toFixed(2)
	        + "%<br/>Risk: " + xValue(d).toFixed(2) + "%"});
               //.style("left", (d3.event.pageX + 5) + "px")
               //.style("top", (d3.event.pageY - 28) + "px");
svg.call(tooltip);

// load data
d3.csv(dataUrl, function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.mean = +d.mean;
    d.std = +d.std;
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([0, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-3, d3.max(data, yValue)+6]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Annualized Risk (%)");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Annualized Average Return (%)");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 0)
      .transition()
      .attr("r", 7.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));})
      .style("stroke-width", "0px")
      .style("shape-rendering", "geometricPrecision")
      .duration(1500);

  // add tooltip effect
  svg.selectAll(".dot")
      .on("mouseover", tooltip.show)
      .on("mouseout", tooltip.hide);

  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", color)
      .style("stroke", "#000")
      .style("stroke-width", "0px")
      .style("shape-rendering", "crispEdges");

  // draw legend text
  legend.append("text")
      .attr("x", width - 5)
      .attr("y", 5)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .text(function(d) { return d;})
});
}


var baseUrl = "corr?"
var baseUrlRisk = "scatter?"
d3.select("#recalculate").on("click", function() {
	drawCorrelations(baseUrl + "startDate=" + document.getElementById("sd").value + "&endDate=" + document.getElementById("ed").value);
	drawRisk(baseUrlRisk + "startDate=" + document.getElementById("sd").value + "&endDate=" + document.getElementById("ed").value);
})
drawCorrelations(baseUrl + "startDate=" + document.getElementById("sd").value + "&endDate=" + document.getElementById("ed").value)
drawRisk(baseUrlRisk + "startDate=" + document.getElementById("sd").value + "&endDate=" + document.getElementById("ed").value)

