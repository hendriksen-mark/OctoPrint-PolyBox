/*
 * View model for OctoPrint-Polybox
 *
 * Author: Mark Hendriksen
 * License: AGPLv3
 */
$(function() {
    function PolyBoxViewModel(parameters) {
        var self = this;

        // assign the injected parameters
        self.settings = parameters[0];

        self.disconnected = ko.observable();
        self.disconnected(true);
        self.humidity = ko.observable("0.00%");
        self.temp = ko.observable();
        self.w1 = ko.observable();
        self.w2 = ko.observable();
        self.l1 = ko.observable();
        self.l2 = ko.observable();
        self.errorMsg = ko.observable();
        self.calibrationMsg = ko.observable();
        self.scale1_calibration_value = ko.observable();
        self.scale2_calibration_value = ko.observable();
        self.gcodeExtrusion = ko.observable();
        self.boxExtrusion = ko.observable();
        self.extrusionMismatch = ko.computed(function(){return self.gcodeExtrusion() - self.boxExtrusion();}, self);
        self.showHumidityWarning = ko.observable();
        self.warnTemp = ko.observable();

        self.calibrate1 = function() {
            self.calibrate(1);
        };

        self.calibrate2 = function() {
            self.calibrate(2);
        };

        self.calibrate = function(scale) {
            self.errorMsg("");
            self.calibrationMsg("...");
            self.ajaxRequest({"command": "calibrate", "id": scale });
        };

        self.tare1 = function() {
            self.tare(1);
        };

        self.tare2 = function() {
            self.tare(2);
        };

        self.tare = function(id) {
            self.errorMsg("");
            self.ajaxRequest({"command": "tare", "id": id});
        };

        self.zero1 = function() {
            self.zero(1);
        };

        self.zero2 = function() {
            self.zero(2);
        };

        self.zero = function(id) {
            self.errorMsg("");
            self.ajaxRequest({"command": "zero", "id": id});
        };

        self.resetExtMon = function() {
            self.gcodeExtrusion("0.00");
            self.boxExtrusion("0.00");
            self.ajaxRequest({"command": "reset"});
        };

        self.connect = function() {
            self.errorMsg("");
            self.ajaxRequest({"command": "connect"});
        };

        self.onBeforeBinding = () => {
            self.errorMsg("");
            self.boxExtrusion("0.00");
            self.gcodeExtrusion("0.00");
            self.warnTemp(self.settings.settings.plugins.polybox.humidityWarnPercentage());
        };

        self.onDataUpdaterPluginMessage = (pluginIdent, message) => {
            if (pluginIdent === "polybox") {
                if (message.type === "error") {
                    // we can get connection errors via this channel, so don't set disconnected to false for these.
                    self.errorMsg(message.data);
                } else {
                    self.disconnected(false);
                    if (message.type === "status") {
                        message.data.split(" ").forEach(pair => {
                            let parts = pair.split(":");
                            switch (parts[0]) {
                                case 'H':
                                    self.humidity(parts[1]);
                                    self.showHumidityWarning(parseFloat(parts[1].substring(0, parts[1].length-1)) >
                                        parseFloat(self.warnTemp()));
                                    break;
                                case 'T':
                                    self.temp(parts[1]);
                                    break;
                                case 'S1':
                                    self.w1(parts[1]);
                                    break;
                                case 'S2':
                                    self.w2(parts[1]);
                                    break;
                                case 'L1':
                                    self.l1(parts[1]);
                                    break;
                                case 'L2':
                                    self.l2(parts[1]);
                                    break;
                            }
                        });
                    } else if (message.type === "extrusion") {
                        let dataParts = message.data.split("=");
                        switch (dataParts[0]) {
                            case "box":
                                self.boxExtrusion(dataParts[1]);
                                break;
                            case "gcode":
                                self.gcodeExtrusion(dataParts[1]);
                                break;
                        }
                    } else if (message.type === "prompt") {
                        let answer = prompt(message.data.split(":")[1], "0.100");
                        if (answer != null) {
                            self.ajaxRequest({"command": "response", "data": answer});
                        } else {
                            self.ajaxRequest({"command": "response", "data": "CANCEL"});
                        }
                    } else if (message.type === "control") {
                        if (message.data === "disconnected") {
                            self.disconnected(true);
                        } else {
                            let dataSegs = message.data.split(":");
                            if ("CALIBRATION" === dataSegs[0]) {
                                self.calibrationMsg(dataSegs[2]);
                                let vals = dataSegs[1].split(" ");
                                self.scale1_calibration_value(vals[0]);
                                self.scale2_calibration_value(vals[1]);
                            }
                        }
                    }
                }
            }
        };

        self.ajaxRequest = payload => {
            return $.ajax({
                url: API_BASEURL + "plugin/polybox",
                type: "POST",
                dataType: "json",
                data: JSON.stringify(payload),
                contentType: "application/json; charset=UTF-8"
            });
        };

    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: PolyBoxViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ "settingsViewModel" ],
        // Elements to bind to, e.g. #settings_plugin_polybox, #tab_plugin_polybox, ...
        elements: [ "#tab_plugin_polybox", "#navbar_plugin_polybox" ]
    });
});
