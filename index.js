const express = require('express')
const compression = require('compression')
const csrf = require('csurf')
const helmet = require("helmet");
const flash = require('connect-flash')
const mongoose = require('mongoose')
const path = require('path')
const exhbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const homeRouter = require('./routes/home')
const courseRouter = require('./routes/course')
const addRouter = require('./routes/add')
const card = require('./routes/card')
const orderRouter = require('./routes/orders')
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const keys = require('./keys')
const errorPage = require('./middleware/error')
const fileMiddleware = require('./middleware/file')

const app = express()

const hbs = exhbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs_helpers')
})

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: keys.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
app.use(compression())
app.use(flash())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRouter)
app.use('/courses', courseRouter)
app.use('/add', addRouter)
app.use('/card', card)
app.use('/orders', orderRouter)
app.use('/auth',authRouter)
app.use('/profile', profileRouter)

app.use(errorPage)

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useFindAndModify: false})

        const PORT = process.env.PORT || 3000
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()