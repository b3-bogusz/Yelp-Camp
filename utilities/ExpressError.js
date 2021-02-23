// Error Class, extends the native build in  native Error handler //
class ExpressError extends Error {
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;