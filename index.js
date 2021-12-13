const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    logger = require('morgan'),
    {validationResult} = require('express-validator'),
    awilix = require('awilix'), //   Dependency Injection (DI) container for JavaScript
    {scopePerRequest} = require('awilix-express'); // Plugin for integrate awilix into express app

// Load environment variables
if (process.env.DEBUG === false) {
    require('dotenv').config();
} else {
    require('dotenv').config({path: '.env'})
}

// Setup app environment
const appConfig = require('./config');
const isProduction = appConfig.mode === 'production';

// Create global app object
const app = express();

//Add cors
app.use(cors());

// Create IOC container

const container = awilix.createContainer();

// Auto load services
// container.loadModules(['services/*.service.js', awilix.Lifetime.SCOPED], {
//     formatName: 'camelCase'
// });

// Load providers
require('./providers')(container);

//Register add container per request
app.use(scopePerRequest(container));

//Handle validation errors
app.use(function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    } else {
        next();
    }
});

// Create access.log file
let winston = require('./utils/logger');

// Setup logger morgan
app.use(logger('dev', {
    skip: function (req, res) {
        return res.statusCode < 400
    }
}));

// log all requests to access.log
app.use(logger('common', {
    stream: winston.stream
}));

// Normal express config defaults
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(require('method-override')());

// Register routes
app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
const ExceptionHandler = require('./exceptions/handler');
function baseExceptionHandler(err, req, res, next) {
    // add this line to include winston logging
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    winston.error(err.stack);
    ExceptionHandler.handle(err, req, res, next);
}

if (!isProduction) {
    app.use((err, req, res, next) => {
        console.log(err.stack);
        baseExceptionHandler(err, req, res, next);
    });
}


// production error handler
// no stacktrace leaked to user
app.use(baseExceptionHandler);

// finally, let's start our server...
let server = app.listen(appConfig.port, appConfig.host, function () {
    console.log('Listening on port ' + server.address().address + ':' + server.address().port);
});