const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    username: {
      type: String,
      required: true
    },
    log: {
        type: [Object],
        default: []
    } 
})

module.exports = {
    userSchema,
}