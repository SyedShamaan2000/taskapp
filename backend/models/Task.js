const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    completed: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;