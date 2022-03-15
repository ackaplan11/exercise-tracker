const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    username: {
      type: String,
      required: true
    }, 
})

const exerciseSchema = new Schema({
    description: {
        type: String,
        required: true
    }, 
    duration: {
        type: Number,
        required: true
    },
    date: String
})

module.exports = {
    userSchema,
    exerciseSchema
}