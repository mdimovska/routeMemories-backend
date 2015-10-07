module.exports = function (mongoose) {

    var UserSchema = new mongoose.Schema({
        _id: {type: String, unique: true},
        firstName: {type: String},
        lastName: {type: String},
        pictureUrl: {type: String}
    });

    var User = mongoose.model('User', UserSchema);

    //OK
    var login = function (_id, callback) {
        User.findOne({_id: _id}, function (err, doc) {
            callback(null != doc);
        });
    };

    //OK
    var findById = function (accountId, callback) {
        User.findOne({_id: accountId}, function (err, doc) {
            callback(doc);
        });
    }


    //OK
    var register = function (_id, firstName, lastName, pictureUrl, callback) {
        console.log('Registering ' + _id);
        var user = new User({
            _id: _id,
            firstName: firstName,
            lastName: lastName,
            pictureUrl: pictureUrl
        });
        user.save(function (err) {
            if (err) {
                console.log('Error while registering: ' + err);
                callback(false);
            } else {
                console.log('registering was successful');
                callback(true);
            }
        });
    }

    var findAllUsers = function (callback) {
        User.find({}, function (err, resUsers) {
            callback(resUsers);
        });
    }

    return {
        login: login,
        findById: findById,
        register: register,
        findAllUsers: findAllUsers,
        User: User
    }
}