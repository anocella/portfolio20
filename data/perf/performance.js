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
          console.log(dataset)
          console.log('Hello Im here')
          document.getElementById("nav").hidden = false;
          document.getElementById("drawdown").hidden = false;
          document.getElementById("volatility").hidden = false;
          document.getElementById("sharpe").hidden = false;
          document.getElementById("loading").hidden = true;

          var date = [],
                dd1 = [],
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
          formatDate = d3.time.format("%Y")

          dataset.map(function(d){
              date.push(formatDate(parseDate(d.Date)));
              dd1.push(+d.port1_Drawdown);
              vol1.push(+d.port1_Volatility);
              nav1.push(+d.port1_NAV);
              sr1.push(+d.port1_Sharpe);
              dd2.push(+d.port2_Drawdown);
              vol2.push(+d.port2_Volatility);
              nav2.push(+d.port2_NAV);
              sr2.push(+d.port2_Sharpe);
          });
            console.log(date)
          Highcharts.chart('nav', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Cumulative return'
            },
            subtitle: {
                text: 'Performance comparison'
            },
            xAxis: {
                categories: date,
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    day: '%Y',
                    month: '%Y',
                    year: '%Y'
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                labels: {
                    formatter: function () {
                        return '$' + this.value;
                    }
                },
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true
                }
            },
            series: [{
                name: name1,
                data: nav1
            }, {
                name: name2,
                data: nav2
            }]
        }); // end of nav
          Highcharts.chart('drawdown', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Drawdown'
            },
            subtitle: {
                text: 'Performance comparison'
            },
            xAxis: {
                categories: date,
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    day: '%Y',
                    month: '%Y',
                    year: '%Y'
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Drawdown'
                },
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value*100 + '%';
                    }
                },
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true
                }
            },
            series: [{
                name: name1,
                data: dd1
            }, {
                name: name2,
                data: dd2
            }]
        }); // end of drawdown
          Highcharts.chart('volatility', {
            chart: {
                type: 'line'
            },
            title: {
                text: '12-month rolling volatility'
            },
            subtitle: {
                text: 'Performance comparison'
            },
            xAxis: {
                categories: date,
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    day: '%Y',
                    month: '%Y',
                    year: '%Y'
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Volatility'
                },
                labels: {
                    formatter: function () {
                        return this.value*100 + '%';
                    }
                },
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true
                }
            },
            series: [{
                name: name1,
                data: vol1
            }, {
                name: name2,
                data: vol2
            }]
        }); // end of volatility
          Highcharts.chart('sharpe', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Sharpe ratio'
            },
            subtitle: {
                text: 'Performance comparison'
            },
            xAxis: {
                categories: date,
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    day: '%Y',
                    month: '%Y',
                    year: '%Y'
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Sharpe ratio'
                },
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value;
                    }
                },
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true
                }
            },
            series: [{
                name:name1,
                data: sr1
            }, {
                name: name2,
                data: sr2
            }]
        }); // end of Sharpe ratio
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