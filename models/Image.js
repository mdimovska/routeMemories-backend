module.exports = function (mongoose) {

    var ImageSchema = new mongoose.Schema({
        routeId: {type: String},
        imgData: {type: String},
        lat: {type: String},
        lng: {type: String},
        dateTaken: {type: Date}
//        removed: {type: String} //0-not removed, 1-removed
    });

    var Image = mongoose.model('Image', ImageSchema);

    //OK
    var addImage = function (routeId, imgData, lat, lng, dateTaken, callback) {
        var image = new Image({
            routeId: routeId,
            imgData: imgData,
            lat: lat,
            lng: lng,
            dateTaken: dateTaken
//            removed: 0
        });
        image.save(function (err) {
            if (err) {
                callback(false);
                console.log('Error adding the image: ' + err);
            } else {
                callback(true);
                console.log('Image was added');
            }
        });
    }

    var addImages = function (imgList, callback) {
        if (imgList === null || imgList.length === 0) {
            callback(true);
            return;
        }
        Image.collection.insert(imgList, function (err) {
            if (err) {
                callback(false);
                console.log('Error adding images: ' + err);
            } else {
                callback(true);
                console.info('%d images were successfully stored.', imgList.length);
            }
        });
    }

//    //OK (image is not deleted from db.. only the flag 'removed' is set to '1' (1 means deleted)
//    var removeImage = function (image, callback) {
//        if (null == image)
//            return;
//        image.removed = "1";
//        image.save(function (err) {
//            if (err) {
//                callback(false);
//                console.log('Error deleting the image: ' + err);
//            } else {
//                callback(true);
//                console.log('Image was deleted');
//            }
//        });
//    }
//    
    //OK (mage is deleted from db)
    var removeImage = function (image, callback) {
        if (null == image)
            return;
        image.remove(function (err) {
            if (err) {
                callback(false);
                console.log('Error deleting the image: ' + err);
            } else {
                callback(true);
                console.log('Image was deleted');
            }
        });
    }

    //OK
    var findById = function (imageId, callback) {
        Image.findOne({_id: imageId}, function (err, doc) {
            callback(doc);
        });
    }

    //OK
    var getRouteImages = function (imageId, callback) {
        Image.find({routeId: imageId, removed: "0"}, {}, {sort: {dateTaken: -1}}, function (err, doc) { //check
            callback(doc);
        });
    }

    //OK
    var getAllImages = function (callback) {
        Image.find({}, {}, {sort: {dateTaken: -1}}, function (err, doc) { //check
            callback(doc);
        });
    }

    //OK
    var getImagesByRoute = function (routeId, callback) {
        console.log("getting images by route with id: " + routeId);
        Image.find({routeId: routeId}, function (err, doc) { //check
            callback(doc);
        });
    }

    var removeImagesByRoute = function (routeId, callback) {
        Image.remove({routeId: routeId}, function (err) {
            if (err) {
                console.log('Error removing images: ' + err);
                callback(false);
            } else {
                callback(true);
                console.log('Images were removed');
            }
        });
    }


    return {
        findById: findById,
        addImage: addImage,
        addImages: addImages,
        removeImage: removeImage,
        getImagesByRoute: getImagesByRoute,
        getRouteImages: getRouteImages,
        getAllImages: getAllImages,
        removeImagesByRoute: removeImagesByRoute,
        Image: Image
    }
}