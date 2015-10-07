module.exports = function (mongoose) {

    var PhotoSchema = new mongoose.Schema({
        routeId: {type: String},
        photoUrl: {type: String},
//        caption: {type: String},
        lat: {type: String},
        lng: {type: String},
        dateTaken: {type: Date},
        removed: {type: String}, //0-not removed, 1-removed
        photoWidth: {type: String},
        photoHeight: {type: String},
    });

    var Photo = mongoose.model('Photo', PhotoSchema);

    //OK
    var addPhoto = function (routeId, photoUrl, lat, lng, dateTaken, photoWidth, photoHeight, callback) {
        var photo = new Photo({
            routeId: routeId,
            photoUrl: photoUrl,
            lat: lat,
            lng: lng,
            dateTaken: dateTaken,
            photoWidth: photoWidth,
            photoHeight: photoHeight,
            removed: 0
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

    //OK (photo is not deleted from db.. only the flag 'removed' is set to '1' (1 means deleted)
    var removePhoto = function (photo, callback) {
        if (null == photo)
            return;
        photo.removed = "1";
        photo.save(function (err) {
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
    var getAllPhotos = function (callback) {
        Photo.find({}, {}, {sort: {dateTaken: -1}}, function (err, doc) { //check
            callback(doc);
        });
    }


    return {
        findById: findById,
        addPhoto: addPhoto,
        removePhoto: removePhoto,
        getRoutePhotos: getRoutePhotos,
        getAllPhotos: getAllPhotos,
        Photo: Photo
    }
}