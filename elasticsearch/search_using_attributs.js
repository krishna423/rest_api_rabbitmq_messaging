var client = require('./connection.js');

 


client.search({  
  index: 'recharge_index',
  type: 'recharge_status',
  body: {
    query: {
      match: {  'recharge_number' : 1234567890 }
    },
  }
},function (error, response,status) {
    if (error){
      console.log("search error: "+error)
    }
    else {
      console.log("--- Response ---");
      console.log(response);
      console.log("--- Hits ---");
      response.hits.hits.forEach(function(hit){
        console.log(hit);
      })
    }
});