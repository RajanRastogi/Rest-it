module.exports = function() {
	this.And = this.When = this.Then = this.Given;
	
	// documentation for superagent - http://visionmedia.github.io/superagent/ 
	var request = require('superagent');

	// add whatever steps you need
	this.Given(/^the user is "([^"]*)"$/, function(userName, callback){
		this.user = this.userHash[userName]
		if(this.user == null || typeof this.user === "undefined"){
			console.log("Cannot find user "+userName);
			callback.fail(new Error("Invalid user"))
		}
		callback();
	});

	this.When(/^the user requests "([^"]*)" "([^"]*)"$/, function(method, url, callback){
		method = method.toLowerCase();
		if(method === 'delete'){
			method = 'del';
		}
		url = this.matcher.template(url);
		this.req = request[method](url);
		callback();
	});

	this.When(/^the user requests "([^"]*)" "([^"]*)" with data$/, function(method, url, body_data, callback){
		method = method.toLowerCase();
		if(method === 'delete'){
			method = 'del';
		}
		url = this.matcher.template(url);
		body_data = this.matcher.template(body_data);
		this.req = request[method](url)
			.set('Content-Type', 'application/json; charset=UTF-8')
			.send(JSON.parse(body_data));
		callback();
	});

	this.When(/^the user requests "([^"]*)" "([^"]*)" with headers$/, function(method, url, header_data, callback){
		method = method.toLowerCase();
		if(method === 'delete'){
			method = 'del';
		}
		url = this.matcher.template(url);
		var header_string = this.matcher.template(header_data);
		var header = JSON.parse(header_string);
		this.req = request[method](url);
		for(key in header){
			this.req.set(key, header[key]);
		}
		callback();
	});

	this.When(/^data$/, function(body_data, callback){
		body_data = this.matcher.template(body_data);
		this.req = request[method](url)
			.send(JSON.parse(body_data));
		callback();
	});
	
	this.When(/^headers$/, function(header_string, callback){
		header_string = this.matcher.template(header_string);
		var header = JSON.parse(header_string);
		for(key in header){
			this.req.set(key, header[key]);
		}
		callback();
	})

	this.When(/^the response should be$/, function(expected_data, callback){
		var matcher = this.matcher;
		var util = this.util;
		this.req.end(function(err, res){
			if(err){
				console.log("error ", err);
				callback.fail(new Error("There was an error in the response "));
			}
			var data = JSON.stringify(res.body,2,2);
			expected_data = matcher.template(expected_data);
			if(matcher.match(data, expected_data)){
				callback();
			} else {
				console.log("Expected Result:");
				console.log(expected_data);
				console.log("Actual Result:");
				console.log(data);
				callback.fail(new Error("Does not match!"));
			}
		});
	});

	this.When(/^the response with code "([^"]*)" should be$/, function(expected_status_code, expected_data, callback){
		var matcher = this.matcher;
		var util = this.util;
		this.req.end(function(err, res){
			var data = null;
			var status = null;

			if(err){
				data = JSON.stringify(err.response.body);
				status = err.status;
			} else {
				data = JSON.stringify(res.body);
				status = res.status; 
			}
			expected_data = matcher.template(expected_data);
			if(!matcher.match(expected_status_code, status)){
				callback.fail(new Error("Expected status to be "+expected_status_code+" but was "+status));
			}
			if(matcher.match(data, expected_data)){
				callback();
			} else {
				console.log("Expected Result:");
				console.log(util.inspect(JSON.parse(expected_data)));
				console.log("Actual Result:");
				console.log(util.inspect(JSON.parse(data)));
				callback.fail(new Error("Does not match!"));
			}
		});
	});

	this.When(/^the user "([^"]*)" requests "([^"]*)" "([^"]*)" with headers$/, function (user_id, method, url, headers_string, callback) {
	  	method = method.toLowerCase();
		if(method === 'delete'){
			method = 'del';
		}
	    user_id = this.matcher.template(user_id);
		url = this.matcher.template(url);
		headers_string = this.matcher.template(headers_string);
		var header = JSON.parse(headers_string);
  		this.req = request[method](url);
		
		for(key in header){
			this.req.set(key, header[key]);
		}
		
		callback();
	});


	this.When(/^the token is "([^"]*)"$/, function(token){
		this.matcher.setVariable("token", token);
	});
}
