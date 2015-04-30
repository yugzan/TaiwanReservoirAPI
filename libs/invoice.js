var request = require('request');
var async = require('async');
var cheerio = require('cheerio');
var moment = require('moment');

var _RESERVOIRGOVURL = 'http://invoice.etax.nat.gov.tw/invoice.xml';

module.exports = function (callback) {

    async.waterfall([

        /*
         * 得到目前網頁資料的 html
         */
        function (cb){
            request(_RESERVOIRGOVURL, function (error, response, body) {

                if(error){
                    return cb(error);
                }

                cb(null, body);
            });
        },

        /*
         * 解析網頁資料，做成新的 json
         */
        function (html, cb){

            var outputData = [];

            var lastedUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');

            var $ = cheerio.load(html);


            
            $('item').each(function (i, elem){

                if(i > 10 || i < 0){
                    return;
                }
                var title = $(this).find('title').eq(0).text().trim().replace(/(\r\n|\n|\r|\s)/g,'');
                var discription = $(this).find('description').eq(0).text().trim().replace(/(\r\n|\n|\r|\s)/g,'');
                var pubDate = $(this).find('pubDate').eq(0).text().trim().replace(/(\r\n|\n|\r|\s)/g,'');

                var cutP = discription.replace(/<p>/g,'').replace(/<\/p>/g,'x');
                var specialAward = cutP.split('x')[0].replace(/\D/g,'');
                var bestAward = cutP.split('x')[1].replace(/\D/g,'');
                var firstAward = cutP.split('x')[2].replace(/\D+[^\d]/,'').split('、');
                var plusAward = cutP.split('x')[3].replace(/\D+[^\d]/,'').split('、');
                
                var TwoHundred = [];
                TwoHundred.push(specialAward.slice(-3));
                TwoHundred.push(bestAward.slice(-3));
                firstAward.forEach(function(value){
                    TwoHundred.push(value.slice(-3));
                });
                plusAward.forEach(function(value){
                    TwoHundred.push(value);
                });
                
                outputData.push({
                    title: title,
//                    discription: discription,
                    specialAward:specialAward ,
                    bestAward:bestAward,
                    firstAward:firstAward,
                    plusAward:plusAward,
                    pubDate: pubDate,
                    twoHundred:TwoHundred,
                    lastedUpdateTime: lastedUpdateTime
                });
            });

            cb(null, outputData);
        }
    ], function (err, outputData) {

        if (err) {
            return callback(err);
        }

        if (!outputData || outputData.length === 0) {
            return callback(new Error('outputData not found'));
        }


        callback(null, outputData);
    });
};

