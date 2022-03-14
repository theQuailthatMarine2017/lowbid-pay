var auth = require('mpesa-v2');
require('dotenv').config();

var environment = process.env.ENVIRONMENT //Can be either 'production' or 'sandbox'
var consumerKey = process.env.KEY //Enter consumerKey issued by Daraja
var consumerSecret = process.env.SECRET //Enter consumerSecret issues by daraja

//Generates token every 50Min From CronJob
auth.generate(environment,consumerKey,consumerSecret,function(token){
    process.env.AUTH_TOKEN = token.code
});
