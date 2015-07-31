!require('QClass');
var AbstractMonitor = require('../common/AbstractMonitor.js'),
    AjaxProbe = require('../basicProbes/h5Probes/AjaxProbe.js'),
    QClass = window.QClass;


QClass.define('pfMonitor.Monitor.AjaxMonitor',{
    'singleton' : true,

    'extend' : AbstractMonitor,

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
        var ajaxProbe = this.getProbe('ajaxProbe');
        ajaxProbe.on('ajaxError',function(errorInfo){
            console.log(errorInfo);
        });
        ajaxProbe.on('ajaxAbort',function(info){
            console.log(info);
        });
        ajaxProbe.on('ajaxOutLimitTime',function(info){
            console.log(info);
        });
        ajaxProbe.on('ajaxLoadSuccess',function(info){
            console.log(info);
        })
    }
})

module.exports = new window.pfMonitor.Monitor.AjaxMonitor();
