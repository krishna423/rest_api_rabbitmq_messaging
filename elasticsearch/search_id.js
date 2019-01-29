var request = require('request');


exports.elasticsearch_search = function elasticsearch_search_fun (id,recharge_number){
    
    
    //var url = url_gen(data);
    
    var url= 'http://localhost:9200/recharge_index/recharge_status/'+id;
    console.log(url,recharge_number)
    var promise_req=new Promise(function(resolve,reject){

      request(url, { json: true }, (err, response, body) => {
             if (err) {
            //  console.log('error')
              reject('error')
              }
             else{
              //  console.log(body)
                resolve(body);
              }
              

          });
    });
    

     return promise_req;
}
