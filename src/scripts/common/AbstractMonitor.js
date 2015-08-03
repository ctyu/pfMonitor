 !require('QClass');
var utils = require('./utils.js'),
    QClass = window.QClass;

QClass.define('pfMonitor.common.AbstractMonitor',{
    'initialize' : function(){
        this.probeCache = {};
        this.regList = [];
    },

    'regProbe' : function(probeName, probe){
        var self = this;
        if(probe && probeName){
            this.regList.push(probeName);
            self.probeCache[probeName] = probe;
            probe.on('workDone',function(probeData){
                self.onProbeWorkDone && self.onProbeWorkDone(probeName,probeData);
                var index = self.regList.indexOf(probeName);
                if(index >= 0){
                    self.regList.splice(index,1);
                }
                if(self.regList.length === 0){
                    self.onMeasureEnd && self.onMeasureEnd();
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
    },

    'getProbe' : function(id){
        return this.probeCache[id];
    }
});

utils.supportCustEvent(window.pfMonitor.common.AbstractMonitor);

module.exports = window.pfMonitor.common.AbstractMonitor;