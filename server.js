var express = require('express');
var app = express();
var Promise = require('promise');
var bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

//var jsonQuery = require('json-query')

const request = require('request');


var emit_recharge_msg = require('./emit_log_direct.js');


var amqp = require('amqplib/callback_api');
var mail_sending=require('./mailing.js');





// This responds a POST request for the homepage
app.get('/plan_details', function (req, res) {

   var user_recharge_number=req.query.recharge_number;

   var final_response; 





   var promise_req=new Promise(function(resolve,reject){
      
        // request for checking operator name and plans  using recharge  no 

         request('http://www.mocky.io/v2/5c419f6c0f0000473fe7b8de', { json: true }, (err, response, body) => {
      
           if (err) { return console.log(err); }
           else{

                    var data=body;
                    var json_array = data['networks'];
                    for(var ob in json_array){
                      //console.log(json_array[ob])
                        var json_object_operatos=json_array[ob];
                         if(json_object_operatos.recharge_number == user_recharge_number){
                             final_response = {
                               "recharge_number" : user_recharge_number,
                               "operator"    : json_object_operatos.operator,
                               "user_plans"  : json_object_operatos.userplans
                            };
                         //   console.log(final_response)            
                         }
                    }
              }

            if(typeof final_response === "object"){

               resolve(final_response);
            }
            else
               reject('no');
         });

    });
   promise_req.then(function(from_promise_req){
      console.log('resolve'+from_promise_req);
       res.send(from_promise_req)
   }).catch(function(from_promise_req){
      console.log('reject'+from_promise_req)
      res.status(400).send('number not found');
   })
})

  




var unique_id=1;
var common_list=[];

app.get('/recharger_details', function (req, res) {
   // console.log(res)
    common_list.push({"res_obj":res,"unique_id":unique_id});

    var user_recharge_number=req.query.recharge_number;
    var operator=req.query.operator;
    var user_plan=req.query.user_plan;

    var request_details={
      "recharge_number" : user_recharge_number,
      "operator"        : operator,
      "user_plan"       : user_plan,
      "msg_id"          : unique_id,
      "mail_id"        : 'krishna.maurya423@gmail.com'
    };
    unique_id++;


    var promise_req_msg=emit_recharge_msg.recharge(request_details);
    promise_req_msg.then(function(req_msg_status){

      console.log('req_msg_status',req_msg_status,'\n');


          amqp.connect('amqp://localhost', function(err, conn) {
            conn.createChannel(function(err, ch) {

              var ex='direct_logs'
              var q_name = 'abc';
                ch.assertExchange(ex, 'direct', {durable: false});
                //console.log(q_names[i]+ '   '+  operators[i])
                ch.assertQueue(q_name, {exclusive: false}, function(err, q) {
                  if(err){
                    console.log('response queue asserting error',err);
                    res.status(400).send('busy');

                  }
                  console.log(' [*] Waiting for logs. To exit press CTRL+C');
                      ch.bindQueue(q_name, ex, 'response');
                      ch.consume(q_name, function(msg) {
                        var data=    msg.content.toString();
                        console.log(" [x] Received %s", data);

                        ch.ack(msg);
                        
                         if(err){
                           console.log("response error",err);

                         }
                         else{

                              var data_json=JSON.parse(data);

                              console.log('final_response\n',data_json);
                              
                              var response_uni_id=data_json.msg_id;

                              console.log('response_uni_id',response_uni_id);
                              //res.send(data);
                               for(var i=0;i<common_list.length;i++){
                                
                                 var res_check=common_list[i];
                                // console.log('res_check',res_check);

                                 if(response_uni_id === res_check['unique_id']){
                                    
                                    //object delete
                                    var response_obj=res_check['res_obj'];

                                    common_list = common_list.filter(function(item) { 
                                        return item !== res_check
                                    })

                                    
                                    //mail_sending.mail_datails();
                                    //console.log(mail_status);
                                    var status='your recharge has been '+data_json.status+' on Recharge number :  '+data_json.recharge_number+'\n\n'+
                                            '\tPlan Details\t:\t'+data_json.user_plan+'\n'+
                                            '\tdate\t\t:\t'+data_json['date']+'\n'+
                                            '\ttime\t\t:\t'+data_json.time+'\n'+
                                            '\toperator\t:\t'+data_json.operator+'\n';

                                    mail_sending.mail_details(data_json.mail_id,status);
                                    console.log(status);
                                   delete(data_json['msg_id'])

                                   response_obj.send(data_json);

                                   //console.log(data_json)
                                 }
                               }
                              //res.send(data);

                         }
                                                
                    }, {noAck: false});

                });
          
          });
         
        });

    }).catch(function(from_promise_req){
      console.log('reject'+from_promise_req)

      //res.send("error");
   })
  // res.status(404).send('not found');
})



var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})