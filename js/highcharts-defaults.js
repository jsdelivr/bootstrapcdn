Highcharts.setOptions({
    chart: {
        style: {
            fontFamily: 'Arial, Verdana'
        }
    }
});

$('.daterangepicker-text .current-zone').html($('[name=id] option:selected').text());

$('.daterangepicker-content .modal-footer .primary').click(function(){
    $('.daterangepicker-text .current-zone').html($('[name=id] option:selected').text());
});

var default_report_options = {
    chart: {
        height: 200,
        plotBorderColor: '#EEE',
        plotBorderWidth: 0,
        marginBottom: 0,
        spacingTop: -1,
        spacingBottom: 0,
        spacingLeft: 0,
        spacingRight: 0,
    },
    colors: [
        '#058DC7',
        '#AA4643',
        '#89A54E',
        '#80699B',
        '#3D96AE',
        '#DB843D',
        '#92A8CD',
        '#A47D7C',
        '#B5CA92'
    ],
    credits: false,
    legend: {
        enabled: false
    },
    loading: {
        labelStyle: {
            top: '40%'
        }
    },
    title : {
        text: null
    },
    xAxis: {
        dateTimeLabelFormats: {
            second: '%H:%M:%S',
            minute: '%H:%M',
            hour: '%H:%M',
            day: '%b %d',
            week: '%b %d',
            month: '%b \'%y',
            year: '%Y'
        },
        gridLineColor: '#EEEEEE',
        labels: {
            style: {
                color: '#5E88A0'
            },
            y: -10
        },
        showFirstLabel: false,
        showLastLabel: false,
        title: {
            text: null
        }
    },
    yAxis: {
        gridLineColor: '#EEEEEE',
        labels: {
            align: 'left',
            x: 10,
            y: 16
        },
        showFirstLabel: false,
        title: {
            text: null
        }
    },
    tooltip: {
        backgroundColor: "rgba(255,255,255,0.9)",
        borderWidth: 0,
        borderRadius: 2,
        crosshairs: true,
        shared: true,
        style: {
            fontFamily: 'Arial, Verdana'
        }
    },

    plotOptions: {
        area: {
            fillOpacity: .1
        },
        series: {
            cursor: 'pointer',
            point: {
                events: {
                }
            },
            marker: {
                lineWidth: 1
            }
        },
        bar: {
            colorByPoint: true,
            dataLabels: {
                enabled: true,
                formatter: function() {
                    return Highcharts.numberFormat(this.y, 0);
                }
            }
        }
    },
    series: []
};
