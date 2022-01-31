const { v4: uuidv4 } = require('uuid');

class bid{
    constructor(name,bid_placed,lowest,mobile) {
        this.idBIDs = uuidv4();
        this.PRODUCT = name;
        this.BID_AMOUNT = 20;
        this.BID_PLACED = bid_placed;
        this.LOWEST_BID = lowest;
        this.MOBILE_NO = mobile;
        this.DATE = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if(bid_placed > lowest){
            this.BID_DIF =  bid_placed - lowest;
        }
        if(lowest > bid_placed){
            this.BID_DIF = lowest - bid_placed;
        }
        if(lowest === bid_placed){
            this.BID_DIF = 0;
        }

    }
}

//Functions For Access Accounts and Sys Logs
module.exports.bids = function (name,bid_placed,lowest,mobile) {

    const new_ = new bid(name,bid_placed,lowest,mobile);

    //Return Account To Route To Be Saved.
    return new_;
    
}