!require('QClass');
var ErrorProbe = require('../basicProbes/commonProbes/ErrorProbe.js'),
    DefaultH5Probe = require('../basicProbes/h5Probes/DefaultH5Probe.js'),
    AbstractMonitor = require('../common/AbstractMonitor.js'),
    QClass = window.QClass;


QClass.define('pfMonitor.Monitor.BasicH5Monitor',{
    'singleton' : true,

    'extend' : AbstractMonitor,

    'init' : function(probeManager){
        var errorProbe = new ErrorProbe(),
            defaultH5Probe = new DefaultH5Probe();

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
    }
})

module.exports = new window.pfMonitor.Monitor.BasicH5Monitor();
