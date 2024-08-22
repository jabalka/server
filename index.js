const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const projectController = require('./controllers/projectController');
const userController = require('./controllers/userController');
const path = require('path'); // Import the path module

const auth = require('./middlewares/auth');
const { ValidationSecret } = require('./config');
const corsMiddleware = require('./middlewares/corsMiddleware');

start();

async function start(){
    await new Promise((resolve, reject) => {
        mongoose.connect('mongodb://localhost:27017/DevPlace', {
            // can be added some old school properties etc.
        });

        const db = mongoose.connection;
        db.once('open', () => {
            console.log('Database connected!');
            resolve();
        });
        db.on('error', (err) => reject(err));

    });
    const config = require('./config/config');
    const app = express();
    
    app.use(cors({
        origin: config.origin,
        credentials: true
    }));
    // app.use(corsMiddleware())

    app.use(cookieParser());
    app.use(express.json());
    
    app.use('/uploads/profilePics', express.static(path.join(__dirname, 'uploads/profilePics')));
    app.use(auth());

    app.use(session({
        secret: ValidationSecret,
        resave: false,
        saveUninitialized: false
        // Additional session options as needed
    }));

    app.options('*', cors());

    // Add this middleware to serve static files
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static('node_modules'));

    // here all controllers must be specified to be used!
    app.use('/projects', projectController);
    app.use('/user', userController);

    app.get('/', (req, res) => res.send('It works!'));

    app.listen(3000, () => console.info('REST service is running on port 3000'));
}