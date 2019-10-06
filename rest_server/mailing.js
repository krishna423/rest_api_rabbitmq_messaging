var email   = require("emailjs/email");
var fs = require('fs');

exports.mail_details = function mail_send_deatils_fun(mail_address,status){
  var path='./common/credentials.json';
        
      var dd= fs.readFileSync(path,'utf-8')
      var data=JSON.parse(dd);
      var mail_user=data.user;
      var mail_pass=data.pass;

      console.log(mail_user)

 var server  = email.server.connect({
     user:    mail_user,
     password:mail_pass,

     authentication : 'PLAIN',
     host:    "smtp.gmail.com",
     ssl:     true
  });

  // send the message and get a callback with an error or details of the message that was sent
  server.send({
     text:    status,
     from:    mail_user,
     to:      mail_address,
     subject: "Recharge Status"
  }, function(err, message) { console.log(err || message); });


}
