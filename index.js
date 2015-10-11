var express = require("express");
var mongoose = require('mongoose');
var dbPath = 'mongodb://mdimovska:dmilena@ds033484.mongolab.com:33484/heroku_jxq1lgpl';
var uriUtil = require('mongodb-uri');
var mongooseUri = uriUtil.formatMongoose(dbPath);
var bodyParser = require('body-parser');
var fs = require('fs-extra');
var formidable = require('formidable'),
        http = require('http'),
        util = require('util');
//// Import the data layer

// Import the models
var models = {
    User: require('./models/User')(mongoose),
    Image: require('./models/Image')(mongoose),
    Route: require('./models/Route')(mongoose)
};

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
mongoose.connect(mongooseUri, function onMongooseError(err) {
    if (err) {
        console.log(JSON.stringify(err));
        throw err;
    }
});

//CORS middleware
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(allowCrossDomain);

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', function (req, res) {
    next();
});

app.post('/register', function (req, res) {
    var _id = req.body.id;
    console.log("param id: " + _id);
    var name = req.body.name;
    var pictureUrl = req.body.pictureUrl;
    if (null == _id || _id.length < 1 || _id == '') {
        console.log("the id: '" + _id + "' is not properly set");
        res.sendStatus(400);
    } else {
        console.log('id: ', _id);
        console.log('name: ', name);
        console.log('pictureUrl: ', pictureUrl);
        models.User.findById(_id, function (user) {
            if (user) {
                console.log('user already registered');
                res.sendStatus(200);
            }
            else {
                console.log("Registering new user...");
                models.User.register(_id, name, pictureUrl, function (success) {
                    if (!success) {
                        res.sendStatus(400);
                    } else {
                        res.sendStatus(200);
                    }
                });
            }
        });
    }
});

//OK
//returns users
app.get('/users', function (req, res) { //404 if /users/
    models.User.findAllUsers(function (users) {
        if (users) {
            res.sendStatus(users);
        }
        else {
            res.sendStatus(400);
        }
    });
});

//OK
//returns user info by userId   __v is redundant
app.get('/users/:id', function (req, res) { //404 if /users/
    var userId = req.params.id;
    models.User.findById(userId, function (user) {
        if (user) {
            res.sendStatus(user);
        }
        else {
            console.log("User with id: '" + userId + "' not found")
            res.sendStatus(400);
        }
    });
});


// ============================== PHOTOS ============================== //

//OK
//add route
app.post('/routes', function (req, res) {
    console.log('add route request');
    var userId = req.body.userId;
    var latLngList = req.body.latLngList;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var routeName = req.body.routeName;
    var imgList = req.body.imgList;

    if (null === userId || userId === undefined || userId.length < 1 || userId === '') {
        console.log("Bad request. Trying to add route for a user with id: '" + userId + "'");
        res.sendStatus(400);
    } else {
        models.Route.addRoute(userId, latLngList, startDate, endDate, routeName, function (success, route) {
            if (!success) {
                res.sendStatus(400);
            } else {
                // 
                console.log("Successfully saved route. Route id: " + route.id);
                if (imgList !== undefined && imgList !== null && imgList.length > 0) {

                    imgList.forEach(function (image, index) {
                        image['routeId'] = route._id;
                    })

                    models.Image.addImages(imgList, function (success) {
                        if (!success) {
                            res.sendStatus(400);
                        } else {
                            res.sendStatus(200);
                        }
                    });
                } else {
                    res.sendStatus(200);
                }
            }
        });
    }
});


//OK
//delete route
app.delete('/routes/:routeId', function (req, res) {
    var routeId = req.params.routeId;
    // Missing routeId, don't bother going any further
    if (null == routeId || routeId == '') {
        res.sendStatus(400);
    } else {
        models.Route.findById(routeId, function (route) {
            if (!route) {
                res.sendStatus(400);
            } else {
                models.Route.removeRoute(route, function (success) {
                    console.log('s: ' + success);
                    console.log('success: ' + JSON.stringify(success));
                    if (!success) {
                        res.sendStatus(400);
                    } else {
                        res.sendStatus(200);
                    }
                });
            }
        });
    }
});


//OK
//delete image
app.delete('/images/:imageId', function (req, res) {
    var imageId = req.params.imageId;
    // Missing imageId, don't bother going any further
    if (null == imageId || imageId == '') {
        res.sendStatus(400);
    } else {
        models.Image.findById(imageId, function (image) {
            if (!image) {
                res.sendStatus(400);
            } else {
                models.Image.removeImage(image, function (success) {
                    if (!success) {
                        res.sendStatus(400);
                    } else {
                        res.sendStatus(200);
                    }
                });
            }
        });
    }
});

//OK
//get user's routes    //if only /routes/ 404 Not Found error
// if wrong id (id that do not exists in db), returns []
app.get('/routes/getRoutesByUser', function (req, res) {
    var userId = req.query.userId;
    console.log("Getting route list for user with id: '" + userId + "'");
    models.Route.getUserRoutes(userId, function (routeList) {
        res.setHeader('Content-Type', 'application/json');
        res.send(routeList);
    });
});

//OK
//get images by route   //if only /routes/ 404 Not Found error
// if wrong id (id that do not exists in db), returns []
app.get('/images/getImagesByRoute', function (req, res) {
    var routeId = req.query.routeId;
    console.log("Getting image list for route with id: '" + routeId + "'");
    models.Image.getImagesByRoute(routeId, function (imageList) {
        res.setHeader('Content-Type', 'application/json');
        res.send(imageList);
    });    
});

//OK
//get all routes from database
app.get('/routes/', function (req, res) {
    models.Route.getAllRoutes(function (routeList) {
        res.setHeader('Content-Type', 'application/json');
        res.send(routeList);
    });
});

//OK
//returns route info by routeId   __v is redundant
app.get('/routes/:id', function (req, res) { //404 if /route/
    var routeId = req.params.id;
    models.Route.findById(routeId, function (route) {
        if (route) {
            var routeResult = route;
            models.Image.getImagesByRoute(routeId, function (imageList) {
                routeResult.imgList = imageList;
                res.sendStatus(routeResult);
            });
//            res.sendStatus(route);
        }
        else {
            console.log("Route with id: '" + routeId + "' not found")
            res.sendStatus(400);
        }
    });
});


//OK
//get all images from database
app.get('/images/', function (req, res) {
    models.Image.getAllImages(function (images) {
        res.setHeader('Content-Type', 'application/json');
        res.send(images);
    });
});

//OK
//returns image info by imageId 
app.get('/images/:imageId', function (req, res) { //404 if /route/
    var imageId = req.params.imageId;
    models.Image.findById(imageId, function (image) {
        if (image) {
            res.sendStatus(image);
        } else {
            console.log("Image with id: '" + imageId + "' not found")
            res.sendStatus(400);
        }
    });
});

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});