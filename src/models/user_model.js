const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userLoginSchema = new Schema({
    googleId: {
        required: false,
        type: String
    },
    twitterId: {
        required: false,
        type: String
    },
    githubId: {
        required: false,
        type: String
    },
    username: {
        required: true,
        type: String
    }
}
// , {
//   timestamps: true,
// }

);

const userLogin = mongoose.model('userLogin', userLoginSchema);
module.exports = userLogin;