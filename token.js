var auth = require('mpesa-v2');
require('dotenv').config();
var mysql = require('mysql2');

var connection = mysql.createConnection({
    user     : 'lowbid',
    password : 'Jesuspeace93!',
    database : 'lowbid'
  });

var environment = process.env.ENVIRONMENT //Can be either 'production' or 'sandbox'
var consumerKey = process.env.KEY //Enter consumerKey issued by Daraja
var consumerSecret = process.env.SECRET //Enter consumerSecret issues by daraja


//Generates token every 50Min From CronJob
auth.generate(environment,consumerKey,consumerSecret,function(token){
    
    console.log("New Token: " + token.code)
    // UPDATE MYSQL BEARER TABLE
    connection.query('UPDATE TABLE BEARER SET TOKEN = ?',[token.code], function(error,result){
        if (error){
            console.log('<------BID SAVE ERROR-------->');
            //LOG ERROR 
            const log_ = new log('cron job creating new token','token update failed', error, 'auth token update','auth token update');
            connection.query('INSERT INTO SYS_LOGS SET ?', [log_], function (error) {
                if (error){
                    console.log(error)
                    res.json({message:"Server Error"});
                }
              });

        }else{
            if(result != null){
                console.log("Token Updated")
            }
        }
    });

});
