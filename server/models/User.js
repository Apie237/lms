import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        minlength: 2,
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true,
        default: "https://www.gravatar.com/avatar?d=mp",
    },    
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        }
    ],
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);
export default User;