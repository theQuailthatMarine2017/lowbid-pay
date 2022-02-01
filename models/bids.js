const { v4: uuidv4 } = require('uuid');

class bid{
    constructor(name,bid_placed,lowest,mobile,category) {
        this.idBIDs = uuidv4();
        this.PRODUCT = name;
        this.BID_AMOUNT = 20;
        this.BID_PLACED = bid_placed;
        this.LOWEST_BID = lowest;
        this.MOBILE_NO = mobile;
        this.CATEGORY =  category;
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
module.exports.bids = function (name,bid_placed,lowest,mobile,category) {

    const new_ = new bid(name,bid_placed,lowest,mobile,category);

    //Return Account To Route To Be Saved.
    return new_;
    
}