
var amqp = require('amqplib/callback_api');
var Promise = require('promise');
var operator_json = require('./common/operator_json_parse.js');
var asyncLoop = require('node-async-loop');

var req_res = require('./request_response.js');
var elasticsearch_client = require('./elasticsearch/data_add.js');
var elasticsearch_searching = require('./elasticsearch/search_id.js');
var publish_response = require('./response_exchange.js');
var promise_req=new Promise(function(resolve,reject){

  var operator_deatails= operator_json.opertar_queue_details();
  
  if(typeof operator_deatails === "object"){
     resolve(operator_deatails);
  }
  else
     reject('no');
});






promise_req.then(function(from_promise_operators){
    
      //console.log(from_promise_operators);
      var operator_json_array = from_promise_operators['q_name_binding_key_pair'];
      //console.log(operator_json_array)

      asyncLoop(operator_json_array, function (item, next)
          {
        //    console.log(item);
          var operator = item['binding_key'];
          var q_name = item['q_name'];
          console.log(operator + '  '+ q_name)



            amqp.connect('amqp://localhost', function(err, conn) {
                    conn.createChannel(function(err, ch) {
                      var ex = 'direct_logs';

                      ch.assertExchange(ex, 'direct', {durable: false});


                        //console.log(q_names[i]+ '   '+  operators[i])
                        ch.assertQueue(q_name, {exclusive: false}, function(err, q) {
                          console.log(' [*] Waiting for logs. To exit press CTRL+C');

                          //for(var ob in q_names){

                              ch.bindQueue(q_name, ex, operator);
                              ch.consume(q_name, function(msg) {
                                    
                                    ch.ack(msg)
                                    

                                    var recharge_status={};
                                    console.log(" [x] " + q_name +"  %s: '%s'", msg.fields.routingKey, msg.content.toString());
                                    var msg_details=JSON.parse(msg.content.toString());

                                    var request_obj= {  "operator"        : msg.fields.routingKey,
                                                        "recharge_number" : msg_details['recharge_number'],
                                                        "user_plan"       : msg_details['user_plan'],
                                                        "msg_id"          : msg_details['msg_id'],
                                                        "mail_id"         : msg_details['mail_id']

                                    };

                                    console.log('request_obj',request_obj)
                                 


                                    var promise_req_res=req_res.http_req_res(request_obj);

                                    promise_req_res.then(function(from_promise){
                                        console.log('http_query_executed',from_promise)
                                        return from_promise;
                                        // if(from_promise != {})
                                        //   resolve(from_promise);
                                        // else
                                        //   reject({});      // request fail return fail object

                                     }).then(function(status){
                                          // console.log('sssssssss',status)
                                            var today = new Date();
                                            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                            //console.log(date,time)
                                            
                                            recharge_status ={
                                                    "recharge_number" : request_obj.recharge_number,
                                                    "user_plan"       : request_obj.user_plan,
                                                    "msg_id"          : request_obj.msg_id,
                                                    "mail_id"         : request_obj.mail_id,
                                                    "date"            : date,
                                                    "time"            : time,
                                                    "operator"        : status.operator,
                                                    "status"          : status.recharge
                                            };

                                            console.log('recharge_status',recharge_status)

                                            var elasticsearch_status= elasticsearch_client.elasticsearch_insert(recharge_status);
                                            return elasticsearch_status;


                                    //       // resolve({})


                                    }).then(function(elasticsearch_status){
                                        console.log('elasticsearch_insert_status',elasticsearch_status)
                                        var id=elasticsearch_status._id;
                                        console.log('id',id)
                                        var elasticsearch_searching_res = elasticsearch_searching.elasticsearch_search(id,recharge_status.recharge_number);
                                        return elasticsearch_searching_res;  

                                    }).then(function(elasticsearch_searching_res){
                                          console.log('elasticsearch_searching_res\n',elasticsearch_searching_res)

                                          var elasticsearch_filtering_res= elasticsearch_searching_res['_source'];
                                          

                                          console.log('elasticsearch_filtering_res\n',elasticsearch_filtering_res);

                                          return publish_response.publish_res(elasticsearch_filtering_res);


                                    }).then(function(res_msg_status){
                                        console.log(res_msg_status)
                                        //if(res_msg_status=='msg Sent')
                                        


                                    }).catch(function(from_promise_req){
                                       console.log('2222222',from_promise_req)
                                   })




                              }, {noAck: false});

                          });  
                      
                      });
                    });

                    next();
            
                  }).catch(function(from_promise_req){
                  console.log('reject'+from_promise_req)
                  })



















            
          }, function ()
          {
            console.log('Finished!');
      });


      //var q_names= from_promise_operators['q_names'];
      //var operators = from_promise_operators['operators'];

    //  for(var ob in q_names){
    //    console.log(q_names[ob] +  '   '+operators[ob] );
    //  }




      

