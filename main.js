const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const utils = require('./utils')
const router = require('./router')


app.use(express.static('public'))
app.use('/', router)


//Override console.log & console.error to broadcast info using socket.io
utils.overrideLog(function(text) {
  io.emit('log', text)
})

utils.overrideError(function(text) {
  io.emit('error', text)
})


io.on('connection', function(socket){
  console.log('Client connected');
})


http.listen(3000, function(){
  console.log('Listening on port 3000...');
})




