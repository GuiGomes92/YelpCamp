//this is used to wrap our async functions and catch any errors that are thrown.

//We return a function that accepts a function and executes 
//that function, catching any errors and passing it to next if there is one.
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}