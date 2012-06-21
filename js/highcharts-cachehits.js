var hits_chart;
         $(document).ready(function(){

             // define the options
             var hits_options = $.extend(true, {}, default_report_options, {
                 chart: {
                     renderTo: 'cachehits',
                     defaultSeriesType: 'area'
                 },
 
                 xAxis: {
                     type: 'datetime',
                     tickWidth: 0,
                     gridLineWidth: 0
                 },

                 yAxis: { // left y axis
                 },

               tooltip: {
                  formatter : function() {
                     var s = '<span style="font-size: 10px">'+Highcharts.dateFormat("%A, %B %d, %Y", this.x)+'</span>';

                     $.each(this.points, function(i, point) {
                         s += '<br/><span style="color:'+default_report_options.colors[i]+'">'+point.series.name +'</span>: '+
                             Highcharts.numberFormat(point.y, 0);
                     });

                     return s;
                  }
               },

               series: [{
                  name: 'Cache Hits',
                  lineWidth: 2,
                  marker: {
                     radius: 4
                  }
               },{
                  name: 'Non-cache Hits',
                  lineWidth: 2,
                  marker: {
                     radius: 4
                  }
               }]
            });

            hits_chart = new Highcharts.Chart(hits_options);

             function loadGraphs(id) {
                 hits_chart.showLoading("Loading...");
		 var d = new Date();
                 var date_from = 'd.dateFormat("Y-m-d));';
                 var date_to = "2012-06-10";

                 jQuery.getJSON('http://www.bootstrapcdn.com/data/daily.stats.json', {nopaginate: 1, date_from: date_from, date_to: 
date_to}, function(data, state, xhr) {
                     var allHits = [],
                       allCacheHits = [];
                     // split the data return into lines and parse them
                     jQuery.each(data.data.stats, function(i, line) {
                     date = Date.parse(line.timestamp +' UTC');

                     allHits.push([
                        date,
                        parseInt(line.noncache_hit, 10)
                     ]);
                     allCacheHits.push([
                        date,
                        parseInt(line.cache_hit, 10)
                     ]);
                   });

                   hits_chart.series[0].setData(allCacheHits);
                   hits_chart.series[1].setData(allHits);

                   hits_chart.hideLoading();
                });
            }

            loadGraphs();
         });
