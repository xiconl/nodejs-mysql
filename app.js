const express = require('express');
const mysql = require('mysql');

const port = 3000;

const app = express();

//Route to set my EJS as view engine and get statics files from views folder
app.set('view engine', 'ejs');
app.use(express.static('views'));

//Route that andles form data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Route to get index.ejs
app.get('/', (req, res) => {
    res.render('index');
});

//Route to get login.ejs
app.get('/login', (req, res) => {
    res.render('login');
});

//Route to get signup.ejs
app.get('/signup', (req, res) => {
    res.render('signup');
});

//Route to post login.ejs
app.post('/login', (req, res) => {
    const { name, email, password } = req.body;
    console.log('login data:', name, email, password)
    res.send('You have sucessfully logged in');
});

//Route to post signup.ejs
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    console.log('signup data:', name, email, password)
    res.send('Signup successful');
});

//Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Donaloy@007#',
    port: 3306,
    database: "form"
})

db.connect((err) => {
    if(err){
        console.log('Error connecting to the database:', err);
        throw err;
    }
    console.log('Connected to the database');

    const table = `SELECT * FROM users`;
    db.query(table, (err, result) => {
        if(err){
            console.log('Error creating databse:', err);
        } else{
           console.log('Database created');
       } 
    })
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})