// wraps async callbacks and catches potential errors //
module.exports = func => {
    // returns new function //
    return (req, res, next) => {
        // executes a function and if there is an error it passes //
        // it to next middleware //
        func(req, res, next).catch(next);
    }
}






