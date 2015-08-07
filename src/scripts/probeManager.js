var utils = require('./common/utils.js'),
    probeCache = {},
    defaultRunTimeType = {
        'onDomReady' : utils.onDomReady
    },
    AbstractProbe = require('./common/AbstractProbe.js');

function load(probes){
    if( utils.core_type(probes) === 'object' ){
        for(var probeName in probes){
            var probe = probes[probeName];
            probe = probeCache[probeName] = probe.instance || probe;
            var runTimeType = probe.runTimeType;
            defaultRunTimeType[runTimeType] ? defaultRunTimeType[runTimeType](function(){
                probe.run();
            }) : probe.run();
        }
    }
}

function getProbeByName(name){
    return probeCache[name];
}

function createProbe(opts){
    opts = opts || {};
    var probe = new AbstractProbe();
    utils.classExtend(probe, opts);
    return probe;
}

window.probeManager = {
    'load' : load,
    'getProbeByName' : getProbeByName,
    'createProbe' : createProbe
}

module.exports = window.probeManager;