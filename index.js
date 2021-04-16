const express = require('express');
const fetch   = require('node-fetch');
const redis   = require('redis');


const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);
const app    = express();

function setResponse(username,repo){

}

//Make request to Github for data
async function getRepos(req,res){

	try{
          console.log('Fetching Data...');

        const {username} = req.params;
	const response   = await fetch(`https://api.github.com/users/${username}`);

	const data = await response.json();
        const repo = data.public_repos;
	console.log(data.public_repos);

        //set data to redis
	client.setex(username,3600,repo);


	res.send(setResponse(username,repo));

	}catch(err){
	  console.error(err);
	  res.status(500);
	}

  res.end(()=>{console.log('Finished data fetching')});
};

// Cache middleware
function cache(req,res,next){

	console.log(req);

	const {username} = req.params;

	client.get(username,(err,data)=>{
         if(err) throw err;

	 if(data !=null){
           res.send(setResponse(username,data));
	 }else{
	   next();
	 }

	});

};


app.get('/repo/:username',cache,getRepos);






app.listen(5000, ()=>{
 console.log(`App listing on port ${PORT}`);
});

