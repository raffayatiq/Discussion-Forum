const mongoose = require('mongoose')

const jobTemp = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    postedby:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"userprofile"
    },
    date: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('jobposting', jobTemp)