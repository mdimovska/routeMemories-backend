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
    Route: require('./models/Route')(mongoose)
};

var imageLocations = "/Users/gkopevski/gk/md/saycheese/images";

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

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


//http.createServer(function (req, res) {
//    /* Display the file upload form. */
//    res.writeHead(200, {'content-type': 'text/html'});
//    res.end(
//            '<form action="http://127.0.0.1:9000/upload" enctype="multipart/form-data" method="post">' +
//            '<input type="text" name="_id" id="_id"><br>' +
//            '<input type="file" name="upload" multiple="multiple"><br>' +
//            '<input type="submit" value="Upload">' +
//            '</form>'
//            );
//
//}).listen(8080);

app.get('/', function (req, res) {
    next();
});
//app.get("/picture/:id/:imageId", function (req, res) {
//    var img = fs.readFileSync("/Users/gkopevski/gk/md/saycheese/images/" + req.params.id + "/" + req.params.imageId);
//    res.writeHead(200, {'Content-Type': 'image/jpg'});
//    res.end(img, 'binary');
//});


//app.post("/upload", function (req, res) {
//    var form = new formidable.IncomingForm();
//
//    form.parse(req, function (err, fields, files) {
//        var targetDirectory = imageLocations + "/" + fields._id;
//        fs.ensureDir(targetDirectory, function (err) {
//            console.log(err); //null
//        });
//        res.writeHead(200, {'content-type': 'text/plain'});
//        res.write('received upload:\n\n');
//        res.end(util.inspect({fields: fields, files: files}));
//
//        fs.copy(files.path.path, targetDirectory + "/" + files.path.name, function (err) {
//            if (err) {
//                console.error(err);
//            }
//            else {
//                console.log("success!");
//                var userId = fields._id;
//                var firstName = fields.firstName;
//                var lastName = fields.lastName;
//                var photoUrl = fields.photoUrl;
//                var photoWidth = fields.photoWidth;
//                var photoHeight = fields.photoHeight;
//                var caption = fields.caption;
//                if (null == userId || userId.length < 1 || userId == '' || null == photoUrl || photoUrl.length < 1 || photoUrl == '') {
//                    console.log('empty inputs for photo saving');
//                } else {
////                    models.Photo.addPhoto(userId, firstName, lastName, photoUrl, caption, photoWidth, photoHeight, function (success) {
////                        if (!success) {
////                            console.log('error in saving the photo');
////                        } else {
////                            console.log('photo saved');
////                        }
////                    });
//                }
//            }
//        }); //copies file
//    });
//    return;
//});

//not necessary
app.post("/deletePicture", function (req, res) {
    var _profileId = req.param('_profileId', null);
    var _pictureId = req.param('_pictureId', null);


    fs.remove(imageLocations + "/" + _profileId + "/" + _pictureId, function (err) {
        if (err) {
            return res.send(401);
        } else {
            console.log("success!");
            return res.send(200);
        }
    });

});


app.post('/register', function (req, res) {
    var _id = req.body.id;
    console.log("param id: " + req.params.id);
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
//add photo (not used)
app.post('/photos/photo', function (req, res) {
    console.log('add photo request');
    var userId = req.param('userId', null);
    var name = req.param('name', null);
    var photoUrl = req.param('photoUrl', null);
    var caption = req.param('caption', null);
    if (null == userId || userId.length < 1 || userId == '' || null == photoUrl || photoUrl.length < 1 || photoUrl == '') {
        res.send(400);
    } else {
//        models.Photo.addPhoto(userId, name, photoUrl, caption, function (success) {
//            if (!success) {
//                res.send(400);
//            } else {
//                res.send(200);
//            }
//        });
    }
});


//OK
//add route
app.post('/routes', function (req, res) {
    console.log('add route request');
    var userId = req.body.userId;
    var latLngList = req.body.latLngList;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var routeName = req.body.routeName;

    if (null === userId || userId.length < 1 || userId === '') {
        console.log("Bad request. Trying to add route for a user with id: '" + userId + "'");
        res.sendStatus(400);
    } else {
        models.Route.addRoute(userId, latLngList, startDate, endDate, routeName, function (success) {
            if (!success) {
                res.sendStatus(400);
            } else {
                res.sendStatus(200);
            }
        });
    }
});


//OK
//delete photo
app.delete('/photos/photo', function (req, res) {
    var photoId = req.param('photoId', null);
    // Missing photoId, don't bother going any further
    if (null == photoId || photoId == '') {
        res.send(400);
    } else {
//        models.Photo.findById(photoId, function (photo) {
//            if (!photo) {
//                res.send(400);
//            } else {
//                models.Photo.removePhoto(photo, function (success) {
//                    if (!success) {
//                        res.send(400);
//                    } else {
//                        res.send(200);
//                    }
//                });
//            }
//        });
    }
});

//OK
//get user's routes    //if only /routes/ 404 Not Found error
// if wrong id (id that do not exists in db), returns []
app.get('/routes/getRoutesByUser', function (req, res) {
    var userId = req.params.userId;
    models.Route.getUserRoutes(userId, function (routeList) {
        res.sendStatus(routeList);
    });
});

//OK
//get all routes from database
app.get('/routes/', function (req, res) {
    models.Route.getAllRoutes(function (routeList) {
        res.sendStatus(routeList);
    });
});

//OK
//returns route info by routeId   __v is redundant
app.get('/routes/:id', function (req, res) { //404 if /route/
    var routeId = req.params.id;
    models.Route.findById(routeId, function (route) {
        if (route) {
            res.sendStatus(route);
        }
        else {
            console.log("Route with id: '" + routeId + "' not found")
            res.sendStatus(400);
        }
    });
});



//OK
//get user's photos    //if only /photos/ 404 Not Found error
// if wrong id (id that do not exists in db), returns []
app.get('/photos/:id', function (req, res) {
    var userId = req.params.id;
//    models.Photo.getUserPhotos(userId, function (photos) {
//        res.send(photos);
//    });
});

//OK
//get all photos from database
app.get('/photos/', function (req, res) {
//    models.Photo.getAllPhotos(function (photos) {
//        res.send(photos);
//    });
});

//OK
//add comment
app.post('/photos/comment', function (req, res) {
    var userId = req.param('userId', null);
    var photoId = req.param('photoId', null);
    var firstName = req.param('firstName', null);
    var lastName = req.param('lastName', null);
    var comment = req.param('comment', null);

    // Missing contactId, don't bother going any further
    if (null == userId || userId == '' || null == comment || comment == '' || null == photoId || photoId == '') {
        res.send(400);
    } else {
//        models.Photo.findById(photoId, function (photo) {
//            if (photo) {
//                models.Photo.addComment(photo, userId, firstName, lastName, comment, function (success) {
//                    if (!success) {
//                        res.send(400);
//                    } else {
//                        res.send(200);
//                    }
//                });
//            }
//            else {
//                res.send(400);
//            }
//        });
    }
});

//OK
//add like (or remove like if exists)
app.post('/photos/like', function (req, res) {
    var userId = req.param('userId', null);
    var photoId = req.param('photoId', null);
    var firstName = req.param('firstName', null);
    var lastName = req.param('lastName', null);

    // Missing contactId, don't bother going any further
    if (null == userId || userId == '' || null == photoId || photoId == '') {
        res.send(400);
    } else {
//        models.Photo.findById(photoId, function (photo, err) {
//            if (photo) {
//                models.Photo.addOrRemoveLike(photo, userId, firstName, lastName, function (success) {
//                    if (!success) {
//                        res.send(400);
//                    } else {
//                        res.send(200);
//                    }
//                });
//            } else {
//                res.send(400);
//            }
//        });
    }
});

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});


module.exports = app;