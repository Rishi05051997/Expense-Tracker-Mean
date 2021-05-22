const express = require('express');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
var app = express();

var config = require('./config/config');
var user = require('./modals/user');
var expense = require('');

var port = process.env.PORT || config.serverPort;

mongoose.connect(config.url, {useUnifiedTopology: true}, (err)=> {
    if(err){
        console.log('Error connecting database please check if MongoDb is connrcted or not');
    } else {
        console.log('Databse connected successfully...');
    }
})

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use((req, res, next)=> {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Origin", "PUT, GET, POST, DELETE, OPTIONS");
    // res.setHeader("Access-Control-Allow-Origin", "*")
});
app.use(cors());

/// basic routes
app.get('/', (req, res)=> {
    res.send('Express server is running at http://localhost:'+ port + '/api');
});

app.post('/register',user.signup);

/// express routes

var apiRoutes = express.Router();

apiRoutes.post('/login', user.login);

/// authenticating users 
apiRoutes.use(user.authenticate); //// route middleware to authenticate & check token

/// authenticated route
apiRoutes.get('/', (req, res)=> {
    res.status(201).json({
        message: 'Welcome to the authenticated route'
    });
});

apiRoutes.get('/user/:id', user.getuserDetails);
apiRoutes.put('/user/:id', user.updateuser);
apiRoutes.put('/password/:id', user.updatepassword);

///// expense start here
apiRoutes.post('/expense/:id', expense.saveExpense);
apiRoutes.delete('/expense/:id', expense.deleteExpense);
apiRoutes.get('/expense/:id', expense.getExpense);
apiRoutes.post('/expense/total/:id', expense.totalExpense);
apiRoutes.post('/expense/report/:id', expense.expenseReport);

app.listen(port);
console.log('Expense watch app is listening at http://localhost'+port);

