const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const { User } = require('./models/User')
const { Note } = require('./models/Note')
const { auth } = require('./middleware/auth')

const config = require('./config/key')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

//register route
app.post('/api/users/register', (req, res) => {

    const user = new User(req.body)
    
    user.save((err, userInfo) => {
        if(err) return res.json({ success : false, err })
        return res.status(200).json({
            success: true
        })
    })
})

//login route
app.post('/api/users/login', (req, res) => {

    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ userID: req.body.userID }, (err, user) => {
  
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "제공된 아이디에 해당하는 유저가 없습니다."
        })
      }
  
      //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
      user.comparePassword(req.body.password, (err, isMatch) => {
  
        if (!isMatch)
          return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
  
        //비밀번호 까지 맞다면 토큰을 생성하기.
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
  
          // 토큰을 저장한다.  어디에 ?  쿠키 , 로컬스토리지 
          res.cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id })
        })
      })
    })
  })

//auth route
app.get('/api/users/auth', auth ,(req,res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    name: req.user.name,
    studentID: req.user.studentID,
    userID: req.user.userID,
    role: req.user.role,
  })
})

app.get('/api/users/logout', auth, (req,res) => {
  User.findOneAndUpdate({ _id: req.user._id},
    {token: ""},
    (err, user) => {
      if(err) return res.json({ success: false, err})
      return res.status(200).send({
        success: true
      })
    })
})

//일지작성 route
app.post('/api/note/write', (req,res) => {
    const note = new Note(req.body)
    note.save((err) => {
        if(err) return res.json( {sucess: false, err})
        return  res.status(200).json({ sucess: true })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))