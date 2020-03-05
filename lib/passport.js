var db = require('../lib/db');
var bcrypt = require('bcryptjs');

module.exports = function (app) {

    /*예전소스
    현재는 db로 사용
    var authData = {
        email: 'egoing777@gmail.com',
        password: '111111',
        nickname: 'egoing'
      };
    */

    var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    //로그인 성공하면 실행
    passport.serializeUser(function (user, done) {
        console.log('ssss',user);
        //세션에 user객체의 id가 생성됨.
        //식별자를 세션에 저장을 하도록 한다!!
        done(null, user.id);
    });

    //매 페이지시마다 실행
    //request안에 user객체가 만들어짐.
    //id파라미터는 serializeUser의 user.id이다
    passport.deserializeUser(function (id, done) {
        console.log('dddd',id);
        var user = db.get('users').find({id:id}).value();
        console.log('user',user);
        done(null, user);
    });



    //login_process에서 아래 미들웨어가 탐.
    //register_process시에는 아래의 로직 안탐.
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pwd'
    },
    function (email, password, done) {
        console.log('LocalStrategy', email, password);
        //먼저 유저가 디비상에 있는지 없는지만 체크한다.
        var user = db.get('users').find({
            email: email
        }).value();
        if (user) {
            //유저가 존재하면 디비상에 암호화된 패스워드와 입력한 패스워드를 모듈을 통해서 검증한다.
            bcrypt.compare(password, user.password, function(err,result){
                if(result){
                    return done(null, user, {
                        message: 'Welcome.'
                    });
                } else {
                    return done(null, false, {
                        message: 'Password is not correct.'
                    });
                }
            });
        } else {
            return done(null, false, {
                message: 'There is no email.'
            });
        }
    }
));
    return passport;
}