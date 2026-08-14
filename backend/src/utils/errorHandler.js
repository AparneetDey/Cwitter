const errorHandler = (err, req, res, next) => {
    const statusCode = err.statuscode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Something went wrong",
        errors: err.error || []
    });
};

export { errorHandler };