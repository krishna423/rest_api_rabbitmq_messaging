


var amqp = require('amqplib/callback_api');





exports.recharge = function recharge_fun(data){
  
  var recharge_number = data.recharge_number;
  var operator = data.operator;
  var user_plan = data.user_plan;
  var msg_id=data.msg_id;
  var mail_id=data.mail_id;
  console.log('',recharge_number+ "    " + operator +"      "+ user_plan+"   "+msg_id)

   var promise_req_msg_stats=new Promise(function(resolve,reject){

        amqp.connect('amqp://localhost', function(err, conn) {
            conn.createChannel(function(err, ch) {
              var ex = 'direct_logs';
              var arg = operator;
              var details={
                        "recharge_number" : recharge_number,
                        "user_plan"       : user_plan,
                        "msg_id"          : msg_id,
                        "mail_id"         : mail_id
              };
              var msg = JSON.stringify(details); 

              
              ch.assertExchange(ex, 'direct', {durable: false});
              ch.publish(ex,arg , new Buffer(msg));
              console.log(" [x] Sent %s: '%s'", arg, msg);
              
              if(err)
                reject("FAIL");
              else
                resolve("SUCCESS");

            });
        });
    });
    return promise_req_msg_stats;
}
  

 


    // var data={
    //  "recharge_number" : 1234567890,
    //   "operator"    : "",
    //   "user_plan"  : 121
    //   };

//recharge(data);


//module.exports = emit_log_direct;
