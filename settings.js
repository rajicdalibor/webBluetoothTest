function settingsController($scope, $mdDialog, peripheral) {

    $scope.hayward = hayward;

    $scope.inputData = {};

    if (peripheral) {
        var uuid = peripheral.uuid;
        uuid = uuid.replace(/:/g, '-');
        copyValues($scope.inputData, JSON.parse(localStorage.getItem('hayward_' + uuid)));
    }

    $scope.submitClick = function () {
        $scope.inputData.changed = true;
        $scope.inputData.graph = $scope.inputData.graph;
        var trim_uuid = peripheral.uuid.replace(/:/g, '-');
        localStorage.setItem('hayward_' + trim_uuid, JSON.stringify($scope.inputData));
        $mdDialog.cancel();
    };

    $scope.reset = function () {
        var default_settings = defaultSettings();
        default_settings.changed = true;
        default_settings.graph = 'text';
        copyValues($scope.inputData, default_settings);
        var trim = peripheral.uuid.replace(/:/g, '-');
        localStorage.setItem('hayward_' + trim_uuid, JSON.stringify(default_settings));
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    function copyValues(toValue, fromValue) {
        toValue.name = fromValue.name;
        toValue.units = fromValue.units;
        toValue.min = fromValue.min;
        toValue.max = fromValue.max;
        toValue.alarmMinValue = fromValue.alarmMinValue;
        toValue.alarmMaxValue = fromValue.alarmMaxValue;
        toValue.alarmMinIsOn = fromValue.alarmMinIsOn;
        toValue.alarmMaxIsOn = fromValue.alarmMaxIsOn;
        toValue.graph = fromValue.graph;
        toValue.changed = fromValue.changed;
    }
}

function defaultSettings() {

    return {
        "name": 'Current',
        "uuid": '',
        "units": 'mA',
        "min": 4,
        "max": 20,
        "alarmMinValue": 4,
        "alarmMaxValue": 20,
        "alarmMinIsOn": false,
        "alarmMaxIsOn": false,
        "version": "1.0",
        "graph": "text",
        "changed": false
    };
}
