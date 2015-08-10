!require('QClass');
var AbstractMonitor = require('../common/AbstractMonitor.js'),
    WebViewBridgeProbe = require('../basicProbes/h5Probes/WebViewBridgeProbe.js'),
    utils = require('../common/utils.js'),
    QClass = window.QClass,
    monitorRules = {};

function execRules(rules){
    if(utils.core_type(rules) !== 'array'){
        rules = [rules];
    }
    rules.forEach(function(rule){
        if(rule.name && rule.monitorName){
            monitorRules[rule.name] = rule;
        }
    });
}


QClass.define('pfMonitor.Monitor.WebViewBridgeMonitor',{
    'singleton' : true,

    'extend' : AbstractMonitor,

    'initialize' : function(opts){
        opts = opts || {};
        this.parent();
        this.monitor = {
            'id' : 'bridge'
        };
        this.limitTime = opts.timeout;
        this.executive = opts && opts.executive;
        execRules(opts.monitorRules);
    },

    'init' : function(probeManager){
        var webViewBridgeProbe = new WebViewBridgeProbe({
            'limitTime' : this.limitTime
        });

        this.regProbe({
            'webViewBridgeProbe' : webViewBridgeProbe
        });

        probeManager.load({
            'webViewBridgeProbe' : webViewBridgeProbe
        });

        this.bindEvents();
    },

    'bindEvents' : function(){
        var webViewBridgeProbe = this.getProbe('webViewBridgeProbe'),
            self = this;
        webViewBridgeProbe.on('bridgeEnd',function(info){
            self.onMeasureProcess('bridgeEnd',info);
        });
        webViewBridgeProbe.on('bridgeTimeout',function(info){
            self.onMeasureProcess('bridgeTimeout',info);
        });
    },

    'config' : function(pageName){
        if(pageName){
            this.monitor.id = pageName + '_' +this.monitor.id;
        }
    },

    'onMeasureProcess' : function(type,info){
        var self = this,
        measureData = {
            'name' : type,
            'data' : info
        },
        bridgeName = info && info.name,
        rule = monitorRules[bridgeName],
        needExecMonitor = false;
        if( bridgeName && rule ){
            switch(type){
                case 'bridgeTimeout' :
                    measureData.monitor = {
                        'id' : this.monitor.id + '_bridgeTimeout',
                        'searchParams' : {
                            'time' : self.limitTime,
                            'name' : rule.monitorName
                        }
                    }
                    needExecMonitor = true;
                break;
                case 'bridgeEnd' :
                    if(info.time && info.time > rule.time){
                        measureData.monitor = {
                            'id' : this.monitor.id + '_bridgeSlow',
                            'searchParams' : {
                                'time' : info.time,
                                'name' : rule.monitorName
                            }
                        }
                        needExecMonitor = true;
                    }
                break;
            }
            needExecMonitor && this.executive && this.executive(measureData);
        }
        this.trigger('measureProcess',measureData);
    },

    'getMonitorRules' : function () {
        return monitorRules;
    }
})

module.exports = window.pfMonitor.Monitor.WebViewBridgeMonitor;
