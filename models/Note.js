const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noteSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required : true
    },
    content: {
        type: String,
        required : true
    }
}, { timestamps : true })



const Note = mongoose.model('Note',noteSchema)

module.exports = { Note }