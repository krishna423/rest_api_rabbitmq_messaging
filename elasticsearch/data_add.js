var client = require('./connection.js');



var id=1;
exports.elasticsearch_insert = function elasticsearch_insert_fun(status_obj){
    
    var promise_req=new Promise(function(resolve,reject){


        client.index({  
          index: 'recharge_index',
          type: 'recharge_status',
          id: id,
          body: status_obj

        },function(err,resp,status) {
              if (err) { 
                  reject('error')
                }
              else{

               // console.log(resp);
                resolve(resp);
              }

        });
    });
    
     promise_req.then(function(from_promise_req){
       // console.log('data_add_promise',from_promise_req);
        id++;
        return(from_promise_req);
        
        }).catch(function(from_promise_req){
          reject('error elasticsearch_insert on inserting');
     })
      //  return from_promise_req;
     //console.log(res)
     return promise_req;
}
















