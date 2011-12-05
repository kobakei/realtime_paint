
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore();
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'secret',
    store: sessionStore
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


// Socket.IO

var cnt = 0;
var template_colors = [
  'rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'  //RGB
]; 
var colors = {};
var connect = require('connect');
io.sockets.on('connection', function (socket) {
  console.log('client connected!');
  // When server receives pos event, it broadcasts all clients.
  socket.on('pos', function (data) {
    // console.log('receive pos event');
    var cookie = socket.handshake.headers.cookie;
    if (cookie) {
      var sid = connect.utils.parseCookie(cookie)['connect.sid'];
      console.log(sid);
      if (sid) {
        if (!colors[sid]) colors[sid] = template_colors[cnt++];
        var param = {
          x: data.x,
          y: data.y,
          color: colors[sid]
        };
        io.sockets.emit('pos', param);  // broadcast
      }
    }
  });
});
