//cucumber's world file https://github.com/cucumber/cucumber-js
// the exported value of this file is used as the context(this) in the step definitions
// it is created freshly for every scenario

// /\$\{(\w+?)\}/gm - ${varName}
// /\$\w+/gm - $varName

var util = require('util');

function Matcher(){
	this.variables = {};
};

Matcher.prototype.extractVarRegex = /\$\{(\w+?)\}/gm;

Matcher.prototype.insertVarRegex = /\$\w+/gm;

Matcher.prototype.matchValues = function(actual, expected){
	var variableName = null;
	if(typeof expected === "undefined"){
		throw { name: "Unmatched" , expected: expected, actual: actual };
	} else if(expected === "*"){
		//ignore this property
		return;
	} else if(typeof expected === "string" && (variableName = expected.match(this.extractVarRegex)) !== null){
		//extract var and store as variable
		variableName = variableName[0];
		this.variables[variableName.replace(/\$|\{|\}/g,"")] = actual;
	} else if(typeof expected === "string" 
		|| typeof expected === "number"
		|| expected === null
	) {
		if(actual !== expected){
			throw { name: "Unmatched" , expected: expected, actual: actual };
		}
	} else if(Array.isArray(actual)){
		//iterate the array value
		this.iterateArray(actual, expected);
	} else if(typeof actual === "object"){
		//iterate the object value
		this.iterateObject(actual, expected);
	}
};

Matcher.prototype.iterateObject = function(actual, expected){
	for(var key in actual){
		if(actual.hasOwnProperty(key)){
			var acPropValue = actual[key];
			var expPropValue = expected[key];
			this.matchValues(acPropValue, expPropValue);		
		}
		delete expected[key];
	}
	if(Object.keys(expected).length > 0){
		throw { name: "Unmatched" , message: "Expected output to have keys "+Object.keys(expected).join(" ")};
	}
};

Matcher.prototype.iterateArray = function(actual, expected){
	if(actual.length !== expected.length){
		throw { name: "Unmatched" , message: "Expected array \n"+expected+"\n got \n"+actual };
	}
	for(var i=0; i<actual.length; i++){
		var actArrVal = actual[i];
		var expArrVal = expected[i];
		this.matchValues(actArrVal, expArrVal);
	}
};

// function to find $variables and replace them with their value
Matcher.prototype.template = function(str){
	var variableList = this.variables;
	return str.replace(this.insertVarRegex, function(match){
		return variableList[match.replace(/\$|\{|\}/g,"")]
	});
};

Matcher.prototype.match = function(actual, expected){
	try{
		var actualJSON = JSON.parse(actual);
		var expectedJSON = JSON.parse(expected);
		this.matchValues(actualJSON, expectedJSON);	
		return true;
	} catch (e){
		console.log("Error ", e);
		return false;
	}
};

Matcher.prototype.getVariable = function(varName){
	return this.variables[varName];
};

Matcher.prototype.setVariable = function(varName, value){
	this.variables[varName] = value;
};

Matcher.prototype.getVariables = function(){
	return JSON.parse(JSON.stringify(this.variables));
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function World(done){
	this.req = null;
	this.util = util;
	this.userHash = {
	};
	this.matcher = new Matcher();
	done();
};

module.exports = function(){
	this.World = World
};
