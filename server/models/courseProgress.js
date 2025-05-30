import mongoose from 'mongoose'

const courseProgressSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    courseId: {type: String, required: true},
    completed: {type: Boolean, required: true},
    lectureCompleted: []
}, {minimize: false})

export const courseProgress = new mongoose.model('courseProgress', courseProgressSchema)