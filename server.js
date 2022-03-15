const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

//create models
const schema = require('./schema.js')
const User = mongoose.model('User', schema.userSchema)
const Exercise = mongoose.model('User', schema.exerciseSchema)

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

app.route('/api/users')
  .get(async (req, res) => {
    User.find()
      .then((users) => {
        res.send(users)
      })
      .catch((err) => {
        console.log(err)
        res.send(400, 'Bad Reqest')
      })
  })
  .post((req, res) => {
    const user = new User({ username: req.body.username });
    user.save()
      .then((user) => {
        res.json(user)
      })
      .catch((err) => {
        console.log(err)
        res.send(400, 'Bad Reqest')
      })
  });