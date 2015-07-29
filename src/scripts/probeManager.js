var utils = require('./common/utils.js'),
    probeCache = {},
    defaultRunTimeType = {
        'onDomReady' : utils.onDomReady
    };

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

module.exports = {
    'load' : load,
    'getProbeByName' : getProbeByName
}