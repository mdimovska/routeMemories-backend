module.exports = function (mongoose) {

    var RouteSchema = new mongoose.Schema({
        userId: {type: String},
        latLngList: {type: String},
        startDate: {type: Date},
        endDate: {type: Date},
        removed: {type: String}, //0-not removed, 1-removed
        routeName: {type: String}
    });

    var Route = mongoose.model('Route', RouteSchema);

    //OK
    var addRoute = function (userId, latLngList, startDate, endDate, routeName, callback) {
        var route = new Route({
            userId: userId,
            latLngList: latLngList,
            startDate: startDate,
            endDate: endDate,
            routeName: routeName,
            removed: 0
        });
        route.save(function (err, savedRoute) {
            if (err) {
                callback(false);
                console.log('Error adding the route: ' + err);
            } else {
                callback(true, savedRoute);
                console.log('Route was added');
            }
        });
    }

//    //OK (route is not deleted from db.. only the flag 'removed' is set to '1' (1 means deleted)
//    var removeRoute = function (route, callback) {
//        if (null == route)
//            return;
//        route.removed = "1";
//        route.save(function (err) {
//            if (err) {
//                callback(false);
//                console.log('Error deleting the route: ' + err);
//            } else {
//                callback(true);
//                console.log('Route was deleted');
//            }
//        });
//    }

    //OK route is deleted from db
    var removeRoute = function (route, callback) {
        if (null == route)
            return;
        route.remove(function (err) {
            if (err) {
                callback(false);
                console.log('Error deleting the route: ' + err);
            } else {
                callback(true);
                console.log('Route was deleted');
            }
        });
    }

    //OK
    var findById = function (routeId, callback) {
        Route.findOne({_id: routeId}, function (err, doc) {
            callback(doc);
        });
    }

    //OK
    var getUserRoutes = function (userId, callback) {
        Route.find({userId: userId, removed: "0"}, {}, {sort: {startDate: -1}}, function (err, doc) { //check
            callback(doc);
        });
    }
    //returns:
    /*
     [
     {
     "_id": "53ff492d49aa9e681b000004",
     "photoUrl": "urllllllllllllllll",
     "caption": "captionnnnnnnnnn",
     "dateTaken": "2014-08-28T15:22:21.220Z",
     "removed": "0",
     "__v": 0,
     "likes": [],
     "comments": []
     },
     ...
     ]
     */

    //OK
    var getAllRoutes = function (callback) {
        Route.find({}, {}, {sort: {startDate: -1}}, function (err, doc) { //check
            callback(doc);
        });
    }

    return {
        findById: findById,
        addRoute: addRoute,
        removeRoute: removeRoute,
        getUserRoutes: getUserRoutes,
        getAllRoutes: getAllRoutes,
        Route: Route
    }
}