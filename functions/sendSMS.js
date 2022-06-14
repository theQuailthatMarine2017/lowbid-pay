const axios = require('axios');

var sendSMS = function (phone,product) {
    return new Promise(async function (resolve, reject) {
        let res = await axios.post('http://45.63.51.221/api/v2/SendSMS',{
            "SenderId": "Lowbids",
            "Is_Unicode": true,
            "Is_Flash": true,
            "SchedTime": "",
            "GroupId": "",
            "Message": `Congratulations! Your BID using mobile ${phone} has been successfully submitted for Item: ${product}. Keep bidding and you will stand a better chance to walk home with the Item! To keep playing visit the following link: https://lowbids.co.ke`,
            "MobileNumbers": phone,
            "ApiKey": "qJt2sf0eFQT/BFbiULo0LVg/7NYZZvgdkQbOXHpb0Ew=",
            "ClientId": "1e0d7f53-50ef-4a66-ae19-3f68b0ca3ffb"
        });
        let data = res.data;
        console.log(data);
        if (data.Data[0].MessageErrorDescription === 'Success') {
            connection.query('UPDATE PRODUCTS SET COMPLETED = 1 WHERE NAME = ?', [product], function (error, bids) {
                if (error != null) {
                    reject(error);
                }
                console.log(bids);
                resolve(data.Data[0].MessageErrorDescription);
            });
        } else {
            reject('Error Sending SMS');
        }
    });
};

module.exports = sendSMS;