
var fs = require('fs');



exports.opertar_queue_details = function opertar_queue_details_fun(){
    var path=__dirname+'/'+'queue_operator_details.json'
      
    var dd= fs.readFileSync(path,'utf-8')
    var data=JSON.parse(dd);  

    return data;

}

