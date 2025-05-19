const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbUrl = process.env.DB_CONNECTION_URL;
if (!dbUrl) {
    console.error("DB_CONNECTION_URL is not set in .env");
    process.exit(1);
}


const port = process.env.PORT || 3000;

const app = express();

//Route to set my EJS as view engine and get statics files from views folder
app.set('view engine', 'ejs');
app.use(express.static('views'));

//Route that andles form data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Database connection
const parsedUrl = new URL(dbUrl);

const dbConfig = {
    host: parsedUrl.hostname,
    user: parsedUrl.username,
    password: parsedUrl.password,
    port: parsedUrl.port,
    database: parsedUrl.pathname.slice(1)
}

async function startServer() {
    try {
        const db = await mysql.createConnection(dbConfig).promise();
        console.log('Connected to database')


        // Create table if not exists
        const createTableQuery = `
    CREATE TABLE IF NOT EXISTS form(
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255)
    )
    `;
        await db.execute(createTableQuery);
        console.log('Table "form" is ready');

        //Route to get home page
        app.get('/', (req, res) => {
            res.render('index');
        });

        //Route to get signup page
        app.get('/signup', (req, res) => {
            res.render('signup');
        });

        //Route for signup handler
        app.post('/signup', async (req, res) => {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).send('All fields are required');
            }            

            try {
                const [existingUsers] = await db.execute('SELECT * FROM form WHERE email = ?', [email]);
                if (existingUsers.length > 0) {
                    return res.status(400).send('User with this email already exists. Choose a different email.')
                }

                const hashedPassword = await bcrypt.hash(password, 12);

                await db.execute('INSERT INTO form (name, email, password) VALUES (?, ?, ?)', [
                    name,
                    email,
                    hashedPassword
                ]);

                return res.status(201).send('User registered successfully');
            } catch (error) {
                console.error(error);
                return res.status(500).send('Server error')
            }
        });

        //Route to get login page
        app.get('/login', (req, res) => {
            res.render('login');
        });

        //Route for login handler
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).send('All fields are required');
            }

            try{
                const [users] = await db.execute('SELECT * FROM form WHERE email = ? OR name = ?', [email, email]);
                if(users.length === 0) {
                    return res.status(400).send('User not found')
                }

                const user = users[0];
                const isMatch = await bcrypt.compare(password, user.password);

                if(isMatch) {
                    return res.status(200).send('Login successful. Welcome' + ' ' + user.name)
                } else {
                    return res.status(400).send('Invalid password');
                }
            }catch (error) {
                console.error(error);
                return res.status(500).send('Database error');
            };
        });

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}/`)
        })

    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
};

startServer()
