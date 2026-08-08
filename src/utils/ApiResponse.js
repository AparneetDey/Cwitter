class ApiResponse {
    constructor (
        statuscode,
        message = "Successfull",
        data
    ) {
        this.statuscode = statuscode;
        this.message = message;
        this.success = statuscode < 400;
        this.data = data;
    }
}

export { ApiResponse };