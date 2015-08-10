!require('QClass');
var ErrorProbe = require('../basicProbes/commonProbes/ErrorProbe.js'),
    DefaultH5Probe = require('../basicProbes/h5Probes/DefaultH5Probe.js'),
    AbstractMonitor = require('../common/AbstractMonitor.js'),
    QClass = window.QClass;


QClass.define('pfMonitor.Monitor.BasicH5Monitor',{
    'singleton' : true,

    'initialize' : function(opts){
        this.parent();
        this.probeDataCache = {};
        this.executive = opts && opts.executive;
        this.freshfirstFrame = opts && opts.freshfirstFrame || false;
        // 监控名
        this.monitor = {
            'id' : 'basicH5Monitor'
        };
    },

    'extend' : AbstractMonitor,

    'init' : function(probeManager){
        var errorProbe = new ErrorProbe(),
        defaultH5Probe = new DefaultH5Probe(
            {
                'freshfirstFrame' : this.freshfirstFrame
            }
        );

        // 先注册
        this.regProbe({
            'errorProbe' : errorProbe,
            'defaultH5Probe' : defaultH5Probe
        });

        // 加载探针
        probeManager.load({
            'errorProbe' : errorProbe,
            'defaultH5Probe' : defaultH5Probe
        });
    },

    'getStartTime' : function(){
        if(!this.startTime){
            var timing = window.performance && window.performance.timing || {};
            this.startTime = timing.navigationStart || window.startTime || 0;
        }
        return this.startTime;
    },

    'onProcess' : function(probeName,measureData){
        if(!this.probeDataCache[probeName]){
            this.probeDataCache[probeName] = {};
        }
        var measureProcessData;
        if(probeName === 'defaultH5Probe'){
            var probeDataCache = this.probeDataCache[probeName],
                processName = measureData.processName,
                value = measureData.value;
            this.getStartTime();
            // 减去startTime;
            if(processName === 'netWorkType'){
                probeDataCache[processName] = value;
            }else{
                probeDataCache[processName] = value - this.startTime;
                measureProcessData = {
                    'monitor' : {
                        'id' : this.monitor.id + '_' + processName,
                        'searchParams' : {
                            'time' : probeDataCache[processName]
                        }
                    },
                    'name' : processName,
                    'data' : probeDataCache[processName]
                };
                this.executive && this.executive(measureProcessData);
                this.trigger('measureProcess',measureProcessData);
            }
        }
        if(probeName === 'errorProbe'){
            measureProcessData = {
                'monitor' : {
                    'id' : this.monitor.id + '_' + measureData.processName
                }
            }
            this.executive && this.executive(measureProcessData);
        }
    },

    'updateFirstFrameTime' : function(){
        this.getProbe('defaultH5Probe') && this.getProbe('defaultH5Probe').updateFirstFrameTime();
    },

    'config' : function(pageName){
        if(pageName){
            this.monitor.id = pageName + '_' +this.monitor.id;
        }
    }
})

module.exports = window.pfMonitor.Monitor.BasicH5Monitor;
