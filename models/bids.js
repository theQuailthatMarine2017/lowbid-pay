const { v4: uuidv4 } = require('uuid');

class bid{
    constructor(name,bid_placed,lowest,mobile,category,code) {
        this.idBIDs = uuidv4();
        this.PRODUCT = name;
        this.BID_AMOUNT = 20;
        this.BID_PLACED = bid_placed;
        this.LOWEST_BID = lowest;
        this.MOBILE_NO = mobile;
        this.CATEGORY =  category;
        this.DATE = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.PAID = 0;
        this.MPESA_CODE = code

    }
}

//Functions For Access Accounts and Sys Logs
module.exports.bids = function (name,bid_placed,lowest,mobile,category) {

    const new_ = new bid(name,bid_placed,lowest,mobile,category,code);

    //Return Account To Route To Be Saved.
    return new_;
    
}