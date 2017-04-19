function perfCharts(port1, port2, dataUrl)
{
    document.getElementById("nav").hidden = true;
    document.getElementById("drawdown").hidden = true;
    document.getElementById("volatility").hidden = true;
    document.getElementById("sharpe").hidden = true;
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
					type: 'datetime'
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
				xAxis: {
					type: 'datetime'
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
				xAxis: {
					type: 'datetime'
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
//perfCharts("/perf?portName=myport&startDate=9/01/2007&endDate=01/02/2014")