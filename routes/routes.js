var mysql = require('mysql2');
var axios = require('axios');

require('dotenv').config();

//Africa Talking API
const credentials = {
    apiKey: '7de90b353742c248c91a8fda0629acf7f53a5f3e05b14699fd43e8f8939bdec8',         // use your sandbox app API key for development in the test environment
    username: 'lowbid-web',      // use 'sandbox' for development in the test environment
};
const Africastalking = require('africastalking')(credentials);
const sms = Africastalking.SMS

//SMS API FUNCTION MODULE
const sendSMS = require('../functions/sendSMS');

var connection = mysql.createConnection({
    user     : 'lowbid',
    password : 'Jesuspeace93!',
    database : 'lowbid'
  });

const sys_actions = {
    login:'access_account_login',
    access_account:{
        create:'created_access_account',
        update:'updated_access_account',
        delete:'deleted_access_account',
        get:'get_access_accounts'

    },
    products:{
        create:'product created',
        updated:'product updated',
        deleted:'product deleted',
        get:'get products'
    },
    bids:{
        create:'bid created',
        updated:'bid updated',
        deleted:'bid deleted',
        get:'get bids'
    },
    logs:{
        create:'log created',
        updated:'log updated',
        deleted:'log deleted',
        get:'get logs'
    },
    mpesa:{
        success:'payment successful',
        failed:'payment failed'
    },
    winners:{
        created:'winner created',
        get:'get winners'
    },
    outcome:{
        success:'success',
        failed:'failed'
    }
}

// SYSTEM LOG
class log{
    constructor(action, outcome, result, ip, device) {
        this.OUTCOME = outcome
        this.ERROR = result
        this.SYS_ACTION = action;
        this.TIME = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.IP_SRC= ip;
        this.DEVICE = device
    }
}

var bidobject = {
    name:'',
    bid_placed:null,
    lowest_bid:null,
    mobile:'',
    mpesa:'',
    category:''
}

module.exports = function(app){

    const bid = require('../models/bids');

    app.get('/hello',(req,res) => {

        res.send("Pay up boi");

    });

    app.post('/bid/place', async (req,response) => {

        response.header("Access-Control-Allow-Origin", "https://lowbids.co.ke");
        response.header("Access-Control-Allow-Methods", "GET","POST");
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept, x-client-key, x-client-token, x-client-secret, Authorization");

        connection.connect();
    
        // let bid_ = bid.bids(req.body.name,req.body.bid_amount,req.body.mobile);
        // console.log(bid_ );
        //Create bid object for use in STK callback route
        

        connection.query('SELECT TOKEN FROM BEARER LIMIT 1', function (err, token) {

            if (err){
                res.json({message:"Server Error"});
            }

            bidobject.name = req.body.product;
            bidobject.bid_placed = req.body.price;
            bidobject.lowest_bid = req.body.lowest;
            bidobject.mobile = req.body.mobile;
            bidobject.category = req.body.category;

            console.log(token[0].TOKEN);
        
            bidobject.mobile = `254${bidobject.mobile.slice(1).replace(" ","")}`;

            var shortcode = 7862616
            var passKey = '1b34cf11242d8bfc37e648d42ced7ed4fb84f4c791833fa5bfe5f774ef7cc6a8'

            let timestamp = require('../middleware/timestamp').timestamp;
            let base64string = new Buffer.from(`${shortcode}${passKey}${timestamp}`).toString('base64');

            axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',{
            "BusinessShortCode": 7862616,
            "Password": base64string,
            "Timestamp": timestamp,
            "TransactionType": "CustomerBuyGoodsOnline",
            "Amount": parseInt(bidobject.lowest_bid),
            "PartyA": parseInt(bidobject.mobile),
            "PartyB": 9810597,
            "PhoneNumber": parseInt(bidobject.mobile),
            "CallBackURL": "https://pay.lowbids.co.ke/payments/bid/callback",
            "AccountReference": "Lowbids | Win Big, Bid Low",
            "TransactionDesc": `Lowbids Bid Payment`
          },{
            headers: {
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token[0].TOKEN}`
            }}).then( res => {
                console.log('<-------MPESA TRANSACTION SENT SUCCESSFULLY! --------->');
                console.log(res.data)
                let bid_ = bid.bids(bidobject.name,bidobject.bid_placed,bidobject.lowest_bid,bidobject.mobile,bidobject.category,res.data.CheckoutRequestID);
                console.log(bid_)
                connection.query('INSERT INTO BIDS SET ?', [bid_], function (err, results) {
                    if (err){
                        const log_ = new log(sys_actions.mpesa.failed,sys_actions.outcome.failed, err, 'mpesa request','mpesa request');
                            connection.query('INSERT INTO SYS_LOGS SET ?', [log_], function (err) {
                                if (err){
                                    res.json({message:"Server Error"});
                                }
                                })
                    }else{
                        response.json({ message: "Payment Request Receieved. Processing" });
                    }
                });
                
            }).catch( Error => {

                console.log(Error)
                if(Error != {}){

                    response.json({error:Error})

                }else{
                    response.json({message:"Payment Request Receieved. Processing"});
                   
                }
                
            });

        });
            
    
    });

    app.post('/payments/bid/callback', async(req,res) => {

        connection.connect();

        console.log("<------ STK RESPONSE ------->")
        //PAYMENT HAD ERROR
        if(req.body.Body.stkCallback.ResultCode === 1 || req.body.Body.stkCallback.ResultCode === 1032 || req.body.Body.stkCallback.ResultCode === 2001 || req.body.Body.stkCallback.ResultCode === 1037){
            // LOG ERROR 
            console.log('<------FAILED MPESA TRANSACTION-------->');
            const log_ = new log(sys_actions.mpesa.failed,sys_actions.outcome.failed, req.body.Body.stkCallback.ResultDesc, 'callback from mpesa','callback from mpesa');
            connection.query('INSERT INTO SYS_LOGS SET ?', [log_], function (error) {
                if (error){
                    res.json({message:"Server Error"});
                }
            });
        }else{
            //PAYMENT WAS SUCCESSFUL, ADD MPESA TRANSACTION CODE FOR BID OBJECT FROM STK RESPONSE
            console.log('<------SUCCESSFUL MPESA TRANSACTION-------->');
            
            connection.query('UPDATE BIDS SET PAID = ? WHERE MPESA_CODE =  ?', [true,req.body.Body.stkCallback.CheckoutRequestID], function (error, results) {
                        if (error){
                            console.log('<------BID SAVE ERROR-------->');
                            //LOG ERROR 
                            const log_ = new log(sys_actions.bids.create,sys_actions.outcome.failed, error, 'callback from  mpesa','callback from mpesa');
                            connection.query('INSERT INTO SYS_LOGS SET ?', [log_], function (error) {
                                if (error){
                                    console.log(error)
                                    res.json({message:"Server Error"});
                                }
                              });

                        }else{

                            console.log("Bid update reulsts "+ results)

                            //IF BID PAID CONFIRMED UPDATE PRODUCTS INFO
                            connection.query('SELECT PRODUCT,BID_AMOUNT,MOBILE_NO FROM BIDS WHERE MPESA_CODE = ? LIMIT 1',[req.body.Body.stkCallback.CheckoutRequestID],function (error,bid){

                                if (error){
                                    console.log('<------BID QUERY ERROR-------->');
                                    console.log(error)

                                }else{

                                console.log(bid)

                                    // SUCCESFUL! UPDATE PRODUCT
                                console.log('<------BID MOUNT UPDATING-------->');
                                connection.query('UPDATE PRODUCTS SET TOTAL_BIDS = TOTAL_BIDS + 1, AMOUNT_RAISED = AMOUNT_RAISED + ? WHERE NAME = ?' , [bid[0].BID_AMOUNT,bid[0].PRODUCT], function (error,results) {
                                    if (error){
                                        console.log(error);
                                    }else{
                                        // log action
                                        console.log(results);
                                        console.log('<------BID AMOUNT UPDATED-------->');
                                        const log_ = new log(sys_actions.products.updated,sys_actions.outcome.success,null, 'callback from mpesa','callback from mpesa');
                                        // Neat!
                                        connection.query('INSERT INTO SYS_LOGS SET ?', [log_], async function (error) {
                                            if (error){
                                                        console.log(error);
                                                    }else{
                                                        // Neat!
                                                        //NEW SMS API
                                                        await sendSMS(bid[0].MOBILE_NO, bid[0].PRODUCT).then(function (result) {
                                                            res.status(200).json({message:"Bid Placed",data:result});
                                                        }).catch(function (error) {
                                                            res.status(400).send(error);
                                                        });
                                                        
                                                    }
                                                });
                                            }
                                        });

                                }

                        
                            })
                            
                            
                        }
                      });

        }

    });
}