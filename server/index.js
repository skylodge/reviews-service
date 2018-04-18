const express = require('express');
const db = require('../db/index.js');
const bodyParser = require('body-parser');
// for crossoriginrequest
const cors = require('cors');
const path = require('path');

let app = express();
app.use(bodyParser.json());
app.use(cors());

//server static content
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('/reviews', function (req, res) {
    console.log('server index.js-', req.query);
    const pageIndex = Number(req.query.index);
    console.log('server index.js pageIndex-', typeof pageIndex);
    const startIndex = 5 * (pageIndex - 1);
    const endIndex = 5 * pageIndex;
    //hit db for first get request
    db.find(req.query.locationId, function (err, results) {
        if (err) {
            console.log('server index err while fetching data from db-', err);
            res.sendStatus(404);
        }
        //get reviews of each customer
        reviewInfo = results.map(review => {
            return {
                customerName: review.customerName,
                createdAt: review.createdAt,
                customerProfilePhotoUrl: review.customerProfilePhotoUrl,
                customerReview: review.customerReview,
            }
        });
        const averageRatings = calculateRatings(results);
        let getFive = reviewInfo.slice(startIndex, endIndex);
        let totalReviews = reviewInfo.length;      
        let searchResults = [];  
        let searchResultsReviewsTotal = 0;
        if (req.query.keyword) {     
            searchResults = reviewInfo.filter(review => {
                return (review['customerReview'].indexOf(req.query.keyword)) > -1;
            });     
            getFive = searchResults.slice(startIndex, endIndex);
            searchResultsReviewsTotal = searchResults.length;
            console.log('search results and length -', searchResults, searchResultsReviewsTotal)
            res.json({ getFive, totalReviews, searchResultsReviewsTotal});    
        } else {
            searchResultsReviewsTotal = totalReviews;
            res.json({ getFive, totalReviews, searchResultsReviewsTotal, averageRatings});
        }
    });
});
const calculateRatings = (results) => {
    // console.log('results inside server index-',results)
    var ratingAccuracy = {total:0, count:0};
    var ratingCommunication = {total:0, count:0};
    var ratingCleanliness = {total:0, count:0};
    var ratingCheckIn = {total:0, count:0};
    var ratingLocation = {total:0, count:0};
    var ratingValue = {total:0, count:0};
    for (var i = 0; i < results.length; i++) {
        if (results[i].ratingAccuracy) {
            ratingAccuracy.total += results[i].ratingAccuracy;
            ratingAccuracy.count++;
        }
        if (results[i].ratingCommunication) {
            ratingCommunication.total += results[i].ratingCommunication;
            ratingCommunication.count++;
        }
        if (results[i].ratingCleanliness) {
            ratingCleanliness.total += results[i].ratingCleanliness;
            ratingCleanliness.count++;
        }
        if (results[i].ratingCheckIn) {
            ratingCheckIn.total += results[i].ratingCheckIn;
            ratingCheckIn.count++;
        }
        if (results[i].ratingLocation) {
            ratingLocation.total += results[i].ratingLocation;
            ratingLocation.count++;
        }
        if (results[i].ratingValue) {
            ratingValue.total += results[i].ratingValue;
            ratingValue.count++;
        }
    }
    var averageRatings = {};
    averageRatings.Accuracy = +(Math.round((ratingAccuracy.total/ratingAccuracy.count)+'e+1')+'e-1');
    averageRatings.Communication = +(Math.round((ratingCommunication.total/ratingCommunication.count)+'e+1')+'e-1');
    averageRatings.Cleanliness = +(Math.round((ratingCleanliness.total/ratingCleanliness.count)+'e+1')+'e-1');
    averageRatings.CheckIn = +(Math.round((ratingCheckIn.total/ratingCheckIn.count)+'e+1')+'e-1');
    averageRatings.Location = +(Math.round((ratingLocation.total/ratingLocation.count)+'e+1')+'e-1');
    averageRatings.Value = +(Math.round((ratingValue.total/ratingValue.count)+'e+1')+'e-1');
    averageRatings.overallRating = +(Math.round(((averageRatings.Accuracy+averageRatings.Communication+averageRatings.Cleanliness+averageRatings.CheckIn+ 
        averageRatings.Location + averageRatings.Value)/4)+'e+1')+'e-1');
    console.log('in calculateAvgRatings-',averageRatings);
    return averageRatings;
}

app.post('/reviews/:locationId', function(req, res) {    
    console.log(req.body);
    db.save(sampleReviews, function(err, results) {
            if (err) {
                console.log('error ocured in saving to db-', err);
            }
            console.log('results saving to db-', results);
        });
});

let port = 3000;

app.listen(port, function () {
    console.log(`listening on port ${port}`);
});

module.exports.app = app;