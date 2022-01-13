//necessary imports:
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import User from './models/user.js'
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken';
import auth from './middleware/auth.js';
import mongoSession from 'connect-mongodb-session';



//express configurations start
const app = express();
const __dirname = path.resolve();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(flash());
dotenv.config();
const { TOKEN_KEY, MONGODB_URI } = process.env;

const MongoDBStore = mongoSession(session);

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.use(
    session({
        secret: 'my-secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use(function (req, res, next) {
    res.locals.currentUser = req.session.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
//express configurations end

//mongoose configurations start
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGODB_URI);
}
//mongoose configurations end

// '/' url route renders login page
app.get('/', async (req, res) => {
    res.render('login');
});

// '/login' url route renders login page
app.get('/login', async (req, res) => {
    res.render('login');
});

// '/login' url post route 
app.post('/login', async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            req.flash("error", "Mail ve şifre girmeniz gerekiyor!");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;

            // token added to cookies
            res.cookie('authToken', token);
            
            //save sessions
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect('/users');
            });

        } else {
            //if mail or password is wrong, give feedback to user and redirect login page
            req.flash("error", "Mail veya şifre yanlış.");
            res.redirect('/login');
        }

    } catch (err) {
          //if anything goes wrong, give feedback to user and redirect login page
        console.log(err);
        req.flash("error", "Mail veya şifre yanlış.");
        res.redirect('/login');
    }
});

// '/register' url get route 
app.get('/register', async (req, res) => {
    res.render('register');
});

// '/register' url post route 
app.post('/register', async (req, res) => {
    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name)) {
            req.flash("error", "Hepsi doldurulmalı!");
            res.redirect('/register');
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            req.flash("error", "Bu üye zaten bulunuyor");
            res.redirect('/register');
        }

        //Encrypt user password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        req.flash("success", "Başarıyla kaydoldunuz.");
        res.redirect('/login');
    } catch (err) {
        console.log(err);
    }


});

// 'logout' get route
app.get('/logout', function (req, res) {
    // removes sessions and gives succesful feedback to user
    req.flash("success", "Çıkış yaptınız");
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
});

// '/users' get route, middlewares check JWT token and session info for authentication
app.get('/users', [auth.verifyJWTToken, auth.isLoggedIn], function (req, res) {
    User.find({}, (err, users) => {
        if (err) {
            console.log(err);
        } else {
            // send all users to the client side
            const allUsers = users;
            res.render('users', { users: allUsers });
        }
    });
});

// '/user-agreement' get route
app.get('/user-agreement', function (req, res) {
    res.render('user-agreement');
});

// 404 error page
app.use((req, res, next) => {
    res.status(404).render('404');
});

//express port selection
app.listen(3001, function () {
    console.log("Server has started");
});