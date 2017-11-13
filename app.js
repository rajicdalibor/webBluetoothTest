var app;
(function () {
    app = angular.module('hayward', ['ngMaterial', 'ngMdIcons'])
        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('pink');
            $mdThemingProvider.theme('success-toast');
            $mdThemingProvider.theme('error-toast');

            $mdThemingProvider.alwaysWatchTheme(true);
        })
})();

app.run(['$document', '$window', function ($document, $window) {
    var document = $document[0];
    document.addEventListener('click', function (event) {
        var hasFocus = document.hasFocus();
        if (!hasFocus) $window.focus();
    });
}]);

app.controller('mainController', function ($scope, $mdDialog, $mdToast) {

    $scope.hayward = hayward;
    var count = 0;

    // Disabling the mouse right click event
    document.addEventListener('contextmenu', function(event) {event.preventDefault()});
       
    $scope.options = {

        chart: {
            type: 'solidgauge',
            style: {
                fontFamily: "Dosis, sans-serif",
                fontSize: '20px'
            }
        },

        title: null,

        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        xAxis: {
            gridLineWidth: 1,
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },

        legend: {
            itemStyle: {
                fontWeight: 'bold',
                fontSize: '13px'
            }
        },

        tooltip: {
            enabled: false,
            borderWidth: 0,
            backgroundColor: 'rgba(219,219,216,0.8)',
            shadow: false
        },

        // the value axis
        yAxis: {
            stops: [
                [0.1, '#55BF3B'], // red
                [0.2, '#55BF3B'], // red
                [0.9, '#55BF3B'] // red
            ],
            lineWidth: 1,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 1,
            title: {
                y: -70,
                style: {
                    textTransform: 'uppercase'
                }
            },
            labels: {
                y: 16,
                style: {
                    fontSize: '12px'
                }
            },
            tickPositioner: function () {
                return [4, 8, 12, 16, 20, 1000];
            }
        },

        plotOptions: {
            candlestick: {
                lineColor: '#404048'
            },
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    };

    // The gauge
    function setPieChart(uuid) {
        $('#container-speed-' + uuid).highcharts(Highcharts.merge($scope.options, {

            chart: {
                type: 'solidgauge'
            },

            yAxis: {
                min: 4,
                max: 20,
                tickInterval: 1,
                title: {
                    text: null
                }
            },

            credits: {
                enabled: false
            },

            series: [{
                name: 'Current',
                data: [0],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:35px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || '#03A9F4') + ';fontFamily: "Dosis, sans-serif"' + '">{y}</span><br/>' +
                    '<span style="font-size:12px;color:silver">mA</span></div>'
                },
                tooltip: {
                    valueSuffix: ' mA'
                }
            }]

        }));
    }
    
    $scope.hayward.radi = 'nije pozvezan';

    $scope.hayward.testVrednost = undefined;

    setInterval(function () {
        count = 0;
        for (var uuid in $scope.hayward.peripherals) {
            var trim_uuid = uuid.replace(/:/g, '-');
            if (localStorage.getItem('hayward_' + trim_uuid) == null) {
                var default_settings = defaultSettings();
                default_settings.uuid = uuid;
                localStorage.setItem('hayward_' + trim_uuid, JSON.stringify(default_settings));
            }

            var chart = $('#container-speed-' + trim_uuid).highcharts(),
                point,
                newVal;

            if (chart) {
                point = chart.series[0].points[0];
            }

            var settings = JSON.parse(localStorage.getItem('hayward_' + trim_uuid));
            if (settings) {
                $scope.hayward.peripherals[uuid].userGivenName = settings.name;
                $scope.hayward.peripherals[uuid].units = settings.units;
                $scope.hayward.peripherals[uuid].graph = settings.graph;

                if ($scope.hayward.peripherals[uuid].currentValue) {
                    $scope.hayward.peripherals[uuid].valid = true;

                    var min = settings.min;
                    var max = settings.max;
                    var changes = false;
                    if (settings.changed == true || $scope.hayward.peripherals[uuid].isFirst) {
                        var fq = (max - min) / 4 + min;
                        var mid = (max - min) / 2 + min;
                        var lq = ((max - min) / 4) * 3 + min;
                        if (settings.alarmMinIsOn) {
                            var alarmMin = settings.alarmMinValue;
                        } else alarmMin = 0;

                        if (settings.alarmMaxIsOn) {
                            var alarmMax = settings.alarmMaxValue;
                        } else alarmMax = 0;
                        $scope.redrawOnSettingChange(settings.min, settings.max, fq, mid, lq, alarmMin, alarmMax, settings.units, trim_uuid);

                        chart = $('#container-speed-' + trim_uuid).highcharts();

                        if (chart) {
                            point = chart.series[0].points[0];
                        }

                        settings.changed = false;
                        localStorage.setItem('hayward_' + trim_uuid, JSON.stringify(settings));
                        changes = true;
                        $scope.hayward.peripherals[uuid].isFirst = false;
                    }

                    var dif = max - min;
                    var changedValue = (($scope.hayward.peripherals[uuid].currentValue - 4) * (dif / 16));
                    $scope.hayward.peripherals[uuid].finalValue = changedValue + min;
                    $scope.hayward.peripherals[uuid].finalValue = $scope.hayward.peripherals[uuid].finalValue.toFixed(2);

                    if (settings.alarmMinIsOn && $scope.hayward.peripherals[uuid].finalValue < settings.alarmMinValue) {
                        $scope.hayward.peripherals[uuid].alarmEnable = true;
                    } else if (settings.alarmMaxIsOn && $scope.hayward.peripherals[uuid].finalValue > settings.alarmMaxValue) {
                        $scope.hayward.peripherals[uuid].alarmEnable = true;
                    } else {
                        $scope.hayward.peripherals[uuid].alarmEnable = false;
                    }

                    var current = Math.round($scope.hayward.peripherals[uuid].finalValue);
                    console.log(uuid + ' ---- ' + current);

                    newVal = current;

                    if (chart) {
                        point.update(newVal);
                    }
                } else {
                    $scope.hayward.peripherals[uuid].valid = false;
                }
            }
            count++;
        }
        $scope.$apply();
    }, 1000);

    $scope.redrawOnSettingChange = function (min, max, fq, mid, lq, alarmMin, alarmMax, units, uuid) {
        var leftGradient = $scope.percent(min, max, alarmMin);
        var rightGradient = $scope.percent(min, max, alarmMax);

        if (leftGradient == 0) {
            alarmMin = 0;
        }
        if (rightGradient == 1) {
            alarmMax = 0;
        }

        if (alarmMin != 0 && alarmMax == 0) {
            var colorMid = '#55BF3B';
            var colorLeft = '#DF5353';
            var colorRight = '#55BF3B';
            rightGradient = 1.0;
        }

        if (alarmMin == 0 && alarmMax != 0) {
            var colorMid = '#55BF3B';
            var colorLeft = '#55BF3B';
            var colorRight = '#DF5353';
            leftGradient = rightGradient - (rightGradient / 10);
        }

        if (alarmMin == 0 && alarmMax == 0) {
            var colorMid = '#55BF3B';
            var colorLeft = '#55BF3B';
            var colorRight = '#55BF3B';
            rightGradient = 1.0;
        }

        if (alarmMin != 0 && alarmMax != 0) {
            var colorMid = '#55BF3B';
            var colorLeft = '#DF5353';
            var colorRight = '#DF5353';
        }

        $('#container-speed-' + uuid).highcharts(Highcharts.merge($scope.options, {

            chart: {
                type: 'solidgauge'
            },

            yAxis: {
                min: min,
                max: max,
                tickInterval: 1,
                tickPositioner: function () {
                    return [min, fq, mid, lq, max];
                },
                title: {
                    text: null
                },
                stops: [
                    [leftGradient, colorLeft],
                    [leftGradient, colorMid],
                    [rightGradient, colorRight]
                ]
            },

            credits: {
                enabled: false
            },

            series: [{
                name: 'Current',
                data: [0],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:35px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || '#03A9F4') + ';fontFamily: "Dosis, sans-serif"' + '">{y}</span><br/>' +
                    '<span style="font-size:12px;color:silver">' + units + '</span></div>'
                },
                tooltip: {
                    valueSuffix: ' mA'
                }
            }]
        }));
    };

    $scope.percent = function (min, max, value) {
        dif = max - min;

        realValue = value - min;

        res = (100 * realValue) / dif;

        result = Math.round(res);
        if (result <= 0) {
            return 0;
        } else if (result > 0 && result < 10) {
            return '0.0' + result;
        } else if (result >= 10 && result < 100) {
            return '0.' + result;
        } else return 1;
    };

    $scope.hayward.onSuccess = function (message) {
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .position('top right')
                .hideDelay(2500)
                .theme("success-toast")
        );
    };

    $scope.hayward.onError = function (message) {
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .position('top right')
                .hideDelay(2500)
                .theme("error-toast")
        );
    };

    $scope.hayward.onSuccess('Scanning for devices ....');

    $scope.hayward.updateUI = function () {
        $scope.$apply();
    };

    $scope.showSettingsDialog = function (ev, peripheral) {
        $mdDialog.show({
            controller: settingsController,
            templateUrl: 'settings.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                peripheral: peripheral
            }
        });
    };
});