 !require('QClass');
var utils = require('./utils.js'),
    QClass = window.QClass;

QClass.define('pfMonitor.common.AbstractMonitor',{
    'initialize' : function(){
        this.probeCache = {};
        this.probeDataCache = {};
    },

    'regProbe' : (function(){
        var regList = [];
        return function(probeName, probe){
            var self = this;
            if(probe && probeName){
                regList.push(probeName);
                self.probeCache[probeName] = probe;
                probe.on('workDone',function(probeData){
                    self.probeDataCache[probeName] = probeData;
                    self.trigger('probeWorkDone',{
                        'name' : probeName,
                        'data' : probeData
                    });
                    var index = regList.indexOf(probeName);
                    if(index >= 0){
                        regList.splice(index,1);
                    }
                    if(regList.length === 0){
                        self.trigger('measureEnd',self.probeDataCache);
                    }
                })
            }else{
                if ( utils.core_type(probeName) === 'object' ){
                    for(var key in probeName){
                        self.regProbe(key,probeName[key]);
                    }
                }
            }
        }
    })(),

    'getProbe' : function(id){
        return this.probeCache[id];
    }
});

utils.supportCustEvent(window.pfMonitor.common.AbstractMonitor);

module.exports = window.pfMonitor.common.AbstractMonitor;