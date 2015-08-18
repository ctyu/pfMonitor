!require('QClass');
var AbstractMonitor = require('../common/AbstractMonitor.js'),
    JsonpProbe = require('../basicProbes/h5Probes/JsonpProbe.js'),
    utils = require('../common/utils.js'),
    QClass = window.QClass,
    monitorRules = {};

function execRules(rules){
    if(utils.core_type(rules) !== 'array'){
        rules = [rules];
    }
    rules.forEach(function(rule){
        if(rule.url && rule.monitorName){
            monitorRules[rule.url] = rule;
        }
    });
}


QClass.define('pfMonitor.Monitor.JsonpMonitor',{
    'singleton' : true,

    'extend' : AbstractMonitor,

    'initialize' : function(opts){
        opts = opts || {};
        this.parent();
        this.monitor = {
            'id' : 'jsonpMonitor'
        };
        this.executive = opts && opts.executive;
        execRules(opts.monitorRules);
    },

    'init' : function(probeManager){
        var jsonpProbe = new JsonpProbe();

        this.regProbe({
            'jsonpProbe' : jsonpProbe
        });

        probeManager.load({
            'jsonpProbe' : jsonpProbe
        });

        this.bindEvents();
    },

    'bindEvents' : function(){
        var jsonpProbe = this.getProbe('jsonpProbe'),
            self = this;
        jsonpProbe.on('error',function(errorInfo){
            self.onJsonpEvent('error',errorInfo);
        });
        jsonpProbe.on('loaded',function(info){
            self.onAjaxonJsonpEventEvent('loaded',info);
        });
    },

    'onAjaxonJsonpEventEvent' : function(processName,data){
        var apiName = data.src;
        var indexSearch = apiName.indexOf('?'),
            indexHash = apiName.indexOf('#');
        if(indexSearch > 0){
            apiName = apiName.slice(0,indexSearch);
        }else if( indexHash > 0 ){
            apiName = apiName.slice(0,indexHash);
        }

        if(monitorRules[apiName]){
            var rule = monitorRules[apiName];
            var measureData = {
                'name' : processName,
                'data' : data
            },
            needExecMonitor = false;
            switch(processName){
                case 'error' :
                    if( rule.error || (rule.error === undefined) ){
                        measureData.monitor = {
                            'id' : this.monitor.id + '_' + processName,
                            'name' : rule.monitorName
                        }
                        needExecMonitor = true;
                    }
                break;
                case 'loaded':
                    if(rule.limitTime && rule.limitTime > 0 && rule.limitTime < data.time){
                        measureData.monitor = {
                            'id' : this.monitor.id + '_jsonptimeout',
                            'searchParams' : {
                                'time' : data.time,
                                'name' : rule.monitorName
                            }
                        }
                        needExecMonitor = true;
                    }
                break;
            }
            needExecMonitor && this.executive && this.executive(measureData);
            this.trigger('measureProcess',measureData);
        }
    },

    'config' : function(pageName){
        if(pageName){
            this.monitor.id = pageName + '_' +this.monitor.id;
        }
    },

    'getMonitorRules' : function () {
        return monitorRules;
    }
})

module.exports = window.pfMonitor.Monitor.JsonpMonitor;
