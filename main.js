var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet')
app.use(helmet());
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash');
var db = require('./lib/db');

app.set('port', (process.env.PORT || 5000));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(compression());




//session 선언 -> flash 선언 -> passport 선언
///////////////////////////////////////
app.use(session({
  secret: 'asadlfkj!@#!@#dfgasdg',
  resave: false,
  saveUninitialized: true,
  //파일 스토어 사용하겠다.
  store: new FileStore()
}))
//flash 미들웨어
app.use(flash());

//passport 미들웨어
var passport = require('./lib/passport')(app);
///////////////////////////////////////

//이것도 미들웨어임.
app.get('*', function (request, response, next) {

  request.list = db.get('topics').value();
  next();

  //아래의 소스는 예전에 파일로 가져오던 소스
  /*
  fs.readdir('./data', function (error, filelist) {
    request.list = filelist;
    next();
  });
  */
});

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'));
})
