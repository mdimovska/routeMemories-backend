module.exports = function (mongoose) {

    var PhotoSchema = new mongoose.Schema({
        routeId: {type: String},
        imgData: {type: String},
        lat: {type: String},
        lng: {type: String},
        dateTaken: {type: Date}
//        removed: {type: String} //0-not removed, 1-removed
    });

    var Photo = mongoose.model('Photo', PhotoSchema);

    //OK
    var addPhoto = function (routeId, imgData, lat, lng, dateTaken, callback) {
        var photo = new Photo({
            routeId: routeId,
            imgData: imgData,
            lat: lat,
            lng: lng,
            dateTaken: dateTaken
//            removed: 0
        });
        photo.save(function (err) {
            if (err) {
                callback(false);
                console.log('Error adding the photo: ' + err);
            } else {
                callback(true);
                console.log('Photo was added');
            }
        });
    }

    var addPhotos = function (imgList, callback) {
        if (imgList === null || imgList.length === 0) {
            callback(true);
            return;
        }
        Photo.collection.insert(imgList, function (err) {
            if (err) {
                callback(false);
                console.log('Error adding photos: ' + err);
            } else {
                callback(true);
                console.info('%d photos were successfully stored.', imgList.length);
            }
        });
    }

//    //OK (photo is not deleted from db.. only the flag 'removed' is set to '1' (1 means deleted)
//    var removePhoto = function (photo, callback) {
//        if (null == photo)
//            return;
//        photo.removed = "1";
//        photo.save(function (err) {
//            if (err) {
//                callback(false);
//                console.log('Error deleting the photo: ' + err);
//            } else {
//                callback(true);
//                console.log('Photo was deleted');
//            }
//        });
//    }
//    
    //OK (photo is deleted from db
    var removePhoto = function (photo, callback) {
        if (null == photo)
            return;
        photo.remove(function (err) {
            if (err) {
                callback(false);
                console.log('Error deleting the photo: ' + err);
            } else {
                callback(true);
                console.log('Photo was deleted');
            }
        });
    }

    //OK
    var findById = function (photoId, callback) {
        Photo.findOne({_id: photoId}, function (err, doc) {
            callback(doc);
        });
    }

    //OK
    var getRoutePhotos = function (routeId, callback) {
        Photo.find({routeId: routeId, removed: "0"}, {}, {sort: {dateTaken: -1}}, function (err, doc) { //check
            callback(doc);
        });
    }

    //OK
    var getAllPhotos = function (callback) {
        Photo.find({}, {}, {sort: {dateTaken: -1}}, function (err, doc) { //check
            callback(doc);
        });
    }

    //OK
    var getPhotosByRoute = function (route, callback) {
        console.log("getting photos by route with id: " + route);
//        Photo.find({'routeId': routeId}, {}, {sort: {dateTaken: -1}}, function (err, doc) {
//            console.log("res: " + doc);
//            console.log("res: " + JSON.stringify(doc));
//            callback(doc);
//        });
//        var query = Photo.find({});
//        query.where('routeId', routeId);
//
//        query.exec(function (err, docs) {
//            // called when the `query.complete` or `query.error` are called
//            // internally
//            console.log("res: " + JSON.stringify(docs));
//            callback(docs);
//        });
//        Photo.find({ 'routeId': routeId }, function (err, doc) {
//            console.log("res: " + doc);
//            console.log("res: " + JSON.stringify(doc));
//            callback(doc);
//        });
        Photo.find({routeId: route}, '-routeId', function (err, doc) { //check
            callback(doc);
        });
    }


    return {
        findById: findById,
        addPhoto: addPhoto,
        addPhotos: addPhotos,
        removePhoto: removePhoto,
        getPhotosByRoute: getPhotosByRoute,
        getRoutePhotos: getRoutePhotos,
        getAllPhotos: getAllPhotos,
        Photo: Photo
    }
}