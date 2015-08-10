!require('QClass');
var AbstractMonitor = require('../common/AbstractMonitor.js'),
    AjaxProbe = require('../basicProbes/h5Probes/AjaxProbe.js'),
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


QClass.define('pfMonitor.Monitor.AjaxMonitor',{
    'singleton' : true,

    'extend' : AbstractMonitor,

    'initialize' : function(opts){
        opts = opts || {};
        this.parent();
        this.monitor = {
            'id' : 'ajaxMonitor'
        };
        this.executive = opts && opts.executive;
        execRules(opts.monitorRules);
    },

    'init' : function(probeManager){
        var ajaxProbe = new AjaxProbe();

        this.regProbe({
            'ajaxProbe' : ajaxProbe
        });

        probeManager.load({
            'ajaxProbe' : ajaxProbe
        });

        this.bindEvents();
    },

    'bindEvents' : function(){
        var ajaxProbe = this.getProbe('ajaxProbe'),
            self = this;
        ajaxProbe.on('ajaxError',function(errorInfo){
            self.onAjaxEvent('ajaxError',errorInfo);
        });
        ajaxProbe.on('ajaxAbort',function(info){
            self.onAjaxEvent('ajaxAbort',info);
        });
        ajaxProbe.on('ajaxLoadSuccess',function(info){
            self.onAjaxEvent('ajaxLoadSuccess',info);
        });
    },

    'onAjaxEvent' : function(processName,data){
        var apiName = data.requestUrl;
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
                case 'ajaxError' :
                    if( rule.error || (rule.error === undefined) ){
                        measureData.monitor = {
                            'id' : this.monitor.id + '_' + processName,
                            'name' : rule.monitorName
                        }
                        needExecMonitor = true;
                    }
                break;
                case 'ajaxLoadSuccess':
                    if(rule.limitTime && rule.limitTime > 0 && rule.limitTime < data.afterSend){
                        measureData.monitor = {
                            'id' : this.monitor.id + '_ajaxtimeout',
                            'searchParams' : {
                                'time' : data.afterSend,
                                'name' : rule.monitorName
                            }
                        }
                        needExecMonitor = true;
                    }
                break;
                case 'ajaxAbort' :
                    if(rule.abort || (rule.abort === undefined)){
                        measureData.monitor = {
                            'id' : this.monitor.id + '_' + processName + '_' + rule.monitorName,
                            'searchParams' : {
                                'time' : data.afterSend,
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

module.exports = window.pfMonitor.Monitor.AjaxMonitor;
