require('QClass');
require('../../common/AbstractProbe.js');
var QClass = window.QClass,
    ns = window.pfMonitor.common;

QClass.define('pfMonitor.Probes.common.ErrorProbe',{
    'extend' : ns.AbstractProbe,

    'initialize' : function(){
        this.parent({
            'once' : true
        });
    },

    'singleton' : true,

    'catchError' : function(){
        this.trigger('process',{
            'processName' : 'jserror'
        });
    },

    'run' : function(){
        this.parent();
        var me = this;
        var oriWinOnError = window.onerror;
        window.onerror = function(){
            oriWinOnError && oriWinOnError.apply(window, arguments);
            me.catchError.apply(me);
        }
        this.trigger('workDone');
    }
});

module.exports = window.pfMonitor.Probes.common.ErrorProbe;