var bcrypt = require('bcryptjs');
//10이 디폴트값. 높아질수록 더욱 강력한 보완. 해킹이 어려움..
const saltRounds = 10;
//나의 비밀번호를 이걸로 쳐보자
const myPlaintextPassword = '111111';
const someOtherPlaintextPassword = '111112';
bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    //hash는 암호화된 비밀번호.
    console.log(hash);
    bcrypt.compare(myPlaintextPassword, hash, function(err, result){
        console.log('my password', result);
    })
    bcrypt.compare(someOtherPlaintextPassword, hash, function(err, result){
        console.log('other password', result);
    })
    
});