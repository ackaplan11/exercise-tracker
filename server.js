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

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

//promsie based - decide on one
app.route('/api/users')
  .get((req, res) => {
    User.find()
      .select('_id username')
      .then((users) => {
        return res.send(users)
      })
      .catch((err) => {
        console.log(err)
        return res.send(400, 'Bad Reqest')
      })
  })
  .post((req, res) => {
    const user = new User({ username: req.body.username });
    user.save()
      .then((user) => {
        return res.json(user)
      })
      .catch((err) => {
        console.log(err)
        return res.send(400, 'Bad Reqest')
      })
  });

//callback based - decide on one
app.post('/api/users/:_id/exercises', (req, res) => {
  let id = req.params._id
  let date = (req.body.date) ? new Date(req.body.date) : new Date()
  const exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: date,
  }
  const updates = { $push: { log: exercise }}
  const options = { new : true }
  User.findByIdAndUpdate(id, updates, options, (err, updatedUser) => {
    if (err) {
      console.log('update error:',err);
      return res.json('update error:', err);
    }
    const returnObj = {
      "username": updatedUser.username,
      "description":exercise.description,
      "duration": exercise.duration,
      "date": formatDate(exercise.date),
      "_id": id,
    }
    return res.send(returnObj)
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  
  
  let id = req.params._id
  User.findById(id, (err, user) => {
    if (err) {
      console.log('error:',err);
      return res.json('Bad Request:', err);
    }
    const count = user.log.length
    const log = user.log
    let returnLog = retrieveLogs(log, count, req.query)
  
    const returnObj = {
      "username" : user.username,
      "count": count,
      "_id": id,
      "log": returnLog
    }
    return res.send(returnObj)
  })
})

//Find a better design pattern for this implementation
function retrieveLogs(log, count, query) {
  console.log(query)
  const returnLog = []
  let limit = (query.limit) ? parseInt(query.limit) : count
  let from = (query.from) ? new Date(query.from) : new Date('1970')
  let to = (query.to) ? new Date(query.to) : new Date()
  for (let i = 0; i < count; i++) {
    let exercise = log[i]
    if (exercise.date >= from && exercise.date <= to) {
      exercise.date = formatDate(exercise.date)
      returnLog.push(exercise)
    }
  }
  return returnLog.slice(0, limit)
} 

function formatDate(date) {
  let dateArr = date.toUTCString().replace(',', '').split(' ')
  let dayOfWeek = dateArr[0]
  let dayOfMonth = dateArr[1]
  let month = dateArr[2]
  let year = dateArr[3]
  return `${dayOfWeek} ${month} ${dayOfMonth} ${year}`
}

