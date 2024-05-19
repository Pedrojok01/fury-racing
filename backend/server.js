const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const routes = require('./routes');
const HttpError = require('./models/http-error');


app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/races/', routes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    next(error);
});

// middleware handling undefined error
app.use((error, req, res, next) => {
    
    if(res.headerSet) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occured!' });
});

app.listen(process.env.PORT || 3000);