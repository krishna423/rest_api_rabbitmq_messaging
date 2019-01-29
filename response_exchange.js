var amqp = require('amqplib/callback_api');

exports.publish_res = function publish_res_fun(msg_details){

    var promise_req=new Promise(function(resolve,reject){

          amqp.connect('amqp://localhost', function(err, conn) {
            conn.createChannel(function(err, ch) {
              var ex = 'direct_logs';
              var binding_name = 'response';            
              var msg = JSON.stringify(msg_details); 

              ch.assertExchange(ex, 'direct', {durable: false});
              ch.publish(ex,binding_name , new Buffer(msg));
              console.log(" [x] Sent %s: '%s'", binding_name, msg);
              
              if(err)
              reject('msg not send as response');
              else
              resolve('msg Sent');
            });
            
          });

      });
      promise_req.then(function(msg){
        return msg
      })
      .catch(function(msg){
        console.log(msg)
      })        
    return promise_req;
}
  

 


    var data={ recharge_number: '1234567090',
              user_plan       : '121',
              msg_id          : 1,
              date            : '2019-1-24',
              time            : '11:43:15',
              operator        : 'airtel',
              status          : 'done' 
            }

//publish_res_fun(data);

