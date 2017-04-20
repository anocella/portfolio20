function perfCharts(port1, port2, dataUrl)
{
    document.getElementById("nav").hidden = true;
    document.getElementById("drawdown").hidden = true;
    document.getElementById("volatility").hidden = true;
    document.getElementById("sharpe").hidden = true;
    document.getElementById("navpt").hidden = true;
    document.getElementById("volpt").hidden = true;
    document.getElementById("ddpt").hidden = true;
    document.getElementById("srpt").hidden = true;
    document.getElementById("loading").hidden = false;

    d3.csv(
        dataUrl,
        function(error, dataset)
        {
          if (error) throw err;
          document.getElementById("nav").hidden = false;
          document.getElementById("drawdown").hidden = false;
          document.getElementById("volatility").hidden = false;
          document.getElementById("sharpe").hidden = false;
          document.getElementById("navpt").hidden = false;
        document.getElementById("volpt").hidden = false;
        document.getElementById("ddpt").hidden = false;
        document.getElementById("srpt").hidden = false;
          document.getElementById("loading").hidden = true;

          var   dd1 = [],
                vol1 = [],
                nav1 = [],
                sr1 = [],
                dd2 = [],
                vol2 = [],
                nav2 = [],
                sr2 = [];
                name1 = port1;
                name2 = port2;
          parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse
		  formatDate = d3.time.format("%Y-%m-%d")

          dataset.map(function(d){
          	if (d.port1_Volatility) {
			  vol1.push([new Date(parseDate(d.Date)).getTime(),+d.port1_Volatility])
			  vol2.push([new Date(parseDate(d.Date)).getTime(),+d.port2_Volatility])

			  sr1.push([new Date(parseDate(d.Date)).getTime(),+d.port1_Sharpe])
			  sr2.push([new Date(parseDate(d.Date)).getTime(),+d.port2_Sharpe])
			}

              nav1.push([new Date(parseDate(d.Date)).getTime(),+d.port1_NAV])
			  nav2.push([new Date(parseDate(d.Date)).getTime(),+d.port2_NAV])

			  dd1.push([new Date(parseDate(d.Date)).getTime(),+d.port1_Drawdown])
			  dd2.push([new Date(parseDate(d.Date)).getTime(),+d.port2_Drawdown])

          });
			Highcharts.stockChart('nav', {
				rangeSelector: {
					selected: 5,
                    buttons: [{
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
					    type: 'year',
                        count: 3,
                        text: '3y'
                    }, {
					    type: 'year',
                        count: 5,
                        text: '5y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
				},

				title: {
					text: 'Growth of $100'
				},
				xAxis: {
					type: 'datetime',
				},
				tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
                    valuePrefix: '$'
                },
				yAxis: {
				  allowDecimals: true,
				  labels: {
				  	align:'left',
					formatter: function(){
					  return '$' + this.value;
					}
				  },
                    title: {
                        align: 'high',
                        offset: 10,
                        text: 'Cumulative<br/>  Return',
                        rotation: 0,
                        y: -30
                    }
				},
				legend: {
                    enabled: true,
                },
				series: [{
					name: name1,
					data: nav1,
					tooltip: {
						valueDecimals: 2
					}
				},
				{
					name: name2,
					data: nav2,
					tooltip: {
						valueDecimals: 2
					}
				}]
			}); // end of nav

			Highcharts.stockChart('drawdown', {
				rangeSelector: {
					selected: 5,
                    buttons: [{
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
					    type: 'year',
                        count: 3,
                        text: '3y'
                    }, {
					    type: 'year',
                        count: 5,
                        text: '5y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
				},

				title: {
					text: 'Drawdown'
				},
				tooltip: {
                    //pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
                    pointFormatter: function () {
                        var s = '<span style="color:';
                        s += this.color;
                        s += '">\u25CF</span> ';
                        s += this.series.name;
                        s += ': <b>';
                        s += Math.round(this.y*1000)/10;
                        s += '%</b><br/>';
                        return s;
                    }
                },
				xAxis: {
					type: 'datetime'
				},
				yAxis: {
				  allowDecimals: true,
				  //showFirstLabel: true,
				  showLastLabel: true,
				  labels: {
				  	align:'left',
					formatter: function(){
					  return this.value*100 + '%'
					}
				  },
                    title: {
                        align: 'high',
                        offset: 10,
                        text: 'Portfolio<br/>Drawdown',
                        rotation: 0,
                        y: -30
                    }
				},
				legend: {
                    enabled: true,
                },
				series: [{
					name: name1,
					data: dd1,
					tooltip: {
						valueDecimals: 2
					}
				},
				{
					name: name2,
					data: dd2,
					tooltip: {
						valueDecimals: 2
					}
				}]
			}); // end of drawdown

			Highcharts.stockChart('volatility', {
				rangeSelector: {
					selected: 5,
                    buttons: [{
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
					    type: 'year',
                        count: 3,
                        text: '3y'
                    }, {
					    type: 'year',
                        count: 5,
                        text: '5y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
				},

				title: {
					text: '12-month rolling portfolio volatility'
				},
				tooltip: {
                    //pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
                    pointFormatter: function () {
                        var s = '<span style="color:';
                        s += this.color;
                        s += '">\u25CF</span> ';
                        s += this.series.name;
                        s += ': <b>';
                        s += Math.round(this.y*1000)/10;
                        s += '%</b><br/>';
                        return s;
                    }
                },
				xAxis: {
					type: 'datetime'
						},
				yAxis: {
				  allowDecimals: true,
				  labels: {
				  	align:'left',
					formatter: function(){
					  return this.value*100 + '%'
					}
				  },
                    title: {
                        align: 'high',
                        offset: 10,
                        text: 'Portfolio<br/>Volatility',
                        rotation: 0,
                        y: -30
                    }
				},
				legend: {
                    enabled: true,
                },
				series: [{
					name: name1,
					data: vol1,
					tooltip: {
						valueDecimals: 2
					}
				},
				{
					name: name2,
					data: vol2,
					tooltip: {
						valueDecimals: 2
					}
				}]
			}); // end of volatility

			Highcharts.stockChart('sharpe', {
				rangeSelector: {
					selected: 5,
                    buttons: [{
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
					    type: 'year',
                        count: 3,
                        text: '3y'
                    }, {
					    type: 'year',
                        count: 5,
                        text: '5y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
				},

				title: {
					text: '12-month rolling sharpe ratio'
				},
				xAxis: {
					type: 'datetime'
						},
				yAxis: {
				  allowDecimals: true,
				  labels: {
				  	align:'left',
					formatter: function(){
					  return this.value
					}
				  },
                    title: {
                        align: 'high',
                        offset: 10,
                        text: 'Sharpe<br/>Ratio',
                        rotation: 0,
                        y: -30
                    }
				},
				legend: {
                    enabled: true,
                },
				series: [{
					name: name1,
					data: sr1,
					tooltip: {
						valueDecimals: 2
					}
				},
				{
					name: name2,
					data: sr2,
					tooltip: {
						valueDecimals: 2
					}
				}]
			}); // end of sharpe ratio
        }
    );

}
var baseUrl = "perf?"
var ans1 = document.getElementById("port1");
var ans2 = document.getElementById("port2");

d3.select("#compare").on("click", function() {perfCharts(ans1[ans1.selectedIndex].text,
												ans2[ans2.selectedIndex].text,
												baseUrl + "portName1=" +
												ans1[ans1.selectedIndex].value + "&portName2=" +
												ans2[ans2.selectedIndex].value + "&startDate=" +
												document.getElementById("sd").value + "&endDate=" +
												document.getElementById("ed").value)})

d3.select("#navp").append("p").attr({"id": "navpt","class": "text-sm-left"}).text("Decision to invest " +
    "is made easier if a portfolio delivers long-run returns comparable to riskier options.");
document.getElementById("navpt").hidden = true;
d3.select("#volatilityp").append("p").attr({"id": "volpt","class": "text-sm-left"}).text("A low total portfolio " +
    "volatility discourages the " +
    "market-timing that hurts many investors.");
document.getElementById("volpt").hidden = true;
d3.select("#drawdownp").append("p").attr({"id": "ddpt","class": "text-sm-left"}).text("If the following set of assets " +
    "is the only portfolio " +
    "the investors hold, then total peak-to-trough loss is even more important than if it were just one product they " +
    "hold.");
document.getElementById("ddpt").hidden = true;
d3.select("#sharpep").append("p").attr({"id": "srpt","class": "text-sm-left"}).text("If the following set of assets is " +
    "the only portfolio " +
    "the investors hold, then the most important thing is a good total risk-adjusted return.");
document.getElementById("srpt").hidden = true;
//perfCharts("/perf?portName=myport&startDate=9/01/2007&endDate=01/02/2014")