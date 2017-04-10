					  function drawThings(dataUrl) {
					    //var dataUrl = "http://localhost:5000/corr?startDate=01/02/1991&endDate=01/02/2010"
					    d3.csv(dataUrl, function(error, rows) {
					      var data = [];

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
							  top: 25,
							  right: 100,
							  bottom: 25,
							  left: 25
							},
							width = 1280 - margin.left - margin.right,
							height = 760 - margin.top - margin.bottom,
							domain = d3.set(data.map(function(d) {
							  return d.x
							})).values(),
							num = Math.sqrt(data.length),
							color = d3.scale.linear()
							  .domain([-1, 0, 1])
							  //.range([d3.hsl(240, .4, .6), d3.hsl(120, .4, .6), d3.hsl(0, .8, .5)]);
							  .range(["#ff0000", "#00ff00", "#0000ff"]);

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

					      var cor = svg.selectAll(".cor")
					        .data(data)
					        .enter()
					        .append("g")
					        .attr("class", "cor")
					        .attr("transform", function(d) {
					          return "translate(" + x(d.x) + "," + y(d.y) + ")";
					        });

					      cor.append("rect")
					        .attr("width", xSpace)
					        .attr("height", ySpace)
					        .attr("x", -xSpace / 2)
					        .attr("y", -ySpace / 2)

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
					        .style("font-weight", function(d){
					          if (d.value === 1) {
					            return "bold"
					          }
					        })
					        .style("fill", function(d){
					          if (d.value === 1) {
					            return "#000";
					          } else {
					            return color(d.value);
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
					        .attr("r", function(d){
					          return (width / (num * 4)) * (Math.abs(d.value) + 0.1);
					        })
					        .style("fill", function(d){
					          if (d.value === 1) {
					            return "#000";
					          } else {
					            return color(d.value);
					          }
					        });

					    var aS = d3.scale
					      .linear()
					      .range([-margin.top + 10, height + margin.bottom - 10])
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

			var baseUrl = "http://localhost:5000/corr?"
			d3.select("#recalculate").on("click", function() {drawThings(baseUrl + "startDate=" + document.getElementById("sd").value + "&endDate=" + document.getElementById("ed").value)})
			drawThings(baseUrl + "startDate=" + document.getElementById("sd").value + "&endDate=" + document.getElementById("ed").value)

