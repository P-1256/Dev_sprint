const errorHandler = (err, req, res, next)=>{
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        status: err.status || "Error",
        message: err.message
    });
};

module.exports = errorHandler;