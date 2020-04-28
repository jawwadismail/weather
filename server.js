var express = require('express');
var body_parser = require('body-parser');
var app     = express();

app.set('view engine','ejs');
app.use(body_parser.urlencoded({extended :true}));
var request = require('request-promise');
//  USing request-promise instead of request
// var city = 'Aurangabad';

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "weather"
});




async function getWeather(cities){

	var weather_data = []
	var apiKey = 'a060db80d3593d73d746ee4d778ac849';


	for (var city_obj of cities){
		var city = city_obj.name;
		var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
		var response_body = await request(url);
		var weather_Json = JSON.parse(response_body);
		var weather ={
			city:city,
			temperature : Math.round(weather_Json.main.temp),
			description: weather_Json.weather[0].description,
			icon:weather_Json.weather[0].icon
		};

		weather_data.push(weather);


	}

	return weather_data;
}

// Request returns in json fomat
app.get('/',function(req,res){

	con.connect(function(err) {
	  con.query("SELECT * FROM weather_table", function (err, cities, fields) {

	  	getWeather(cities).then(function(results){
	  		var weather_data = {weather_data:results}
	  		res.render('weather',weather_data);
	  	});

	  });
	});


	
});

app.post('/',function(req,res){

	con.connect(function(err) {
	  var sql = "INSERT INTO weather_table (name) VALUES ?";
	  var values = [[req.body.city_name]];
	  con.query(sql,[values],function (err, result) {});
	});
	res.redirect('/');
});

app.listen(8000);


// asynchronous
// callback functions
// stuffs



// let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`

// request(url, function (err, response, body) {
//   if(err){
//     console.log('error:', error);
//   } else {
//     console.log('body:', body);
//   }
// });


//  Notes

// Here we understand the asynchronous nature of nodejs request is good for one request,
// for multiple use use request-promise which is asynchronous hence async and await
// Since we wanted for all response we did this like this