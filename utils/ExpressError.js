//Error class to deal with errors in the application instead of defining it everytime we need.
class ExpressError extends Error {
    //The constructor method is a special method of a class for creating and initializing an object of that class.
    constructor(message, statusCode) {
        //The super keyword is used to access and call functions on an object's parent.
        super();
        //Set message and status code of the error object to be whatever was passed.
        this.message = message;
        this.statusCode = statusCode;
    }
}

//Export it so we're able to use it elsewhere
module.exports = ExpressError;