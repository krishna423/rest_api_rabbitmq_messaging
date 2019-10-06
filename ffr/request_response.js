
var request = require('request');
var fs =require('fs')

function url_gen(data){

	var operator = data['operator'];
	var file_path = './../gateways/'+operator+'/config.json';
	var dd= fs.readFileSync(file_path,'utf-8')
    var data=JSON.parse(dd);
    var url = data['NETWORK_URL'];
    return url;
}


exports.http_req_res = function http_req_res_fun(data){
		
		
		var url = url_gen(data);
		
		
		var promise_req=new Promise(function(resolve,reject){

			request(url, { json: true }, (err, response, body) => {
	           if (err) { reject('error') }
	           else{
	           		//console.log(body);
	           		//status_response = body;
	           		

	           		if(typeof body  === 'object'){

				        resolve(body);
				    }
		            else
		               reject("error on request");

	           	}

	        });
		});
		
	   promise_req.then(function(from_promise_req){

	      
	      return(from_promise_req);
	      
	      }).catch(function(from_promise_req){
	      	console.log('eroor on http request')
	   })
	    //  return from_promise_req;
	   //console.log(res)
	   return promise_req;
}


// var data={
// 	"operator":"airtel",
//     "recharge_number" : 1234567890,
//     "user_plan"       : 121
// };

//var response=http_req_res(data)
//console.log(response)