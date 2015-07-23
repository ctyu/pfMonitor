var ErrorProbe = require('../basicProbes/commonProbes/ErrorProbe.js'),
    DefaultH5Probe = require('../basicProbes/h5Probes/DefaultH5Probe.js');

function monitor(probeManager){
    var errorProbe = new ErrorProbe(),
        defaultH5Probe = new DefaultH5Probe();

    errorProbe.on('workDone',function(probeData){

    })

    // 加载探针
    probeManager.load({
        'errorProbe' : errorProbe,
        'defaultH5Probe' : defaultH5Probe
    });
}

module.exports = monitor;
