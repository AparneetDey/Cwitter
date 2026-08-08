class ApiError extends Error {
    constructor (
        statuscode,
        message = "Something went wrong!!",
        error = [],
        stack = ""
    ) {
        super(message);
        this.statuscode = statuscode;
        this.success = false;
        this.data = null;
        this.message = message;
        this.error = error;

        if(stack) {
            this.stack = stack;
        } else {
            this.stack = Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };