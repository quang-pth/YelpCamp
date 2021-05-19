module.exports = func => {
    // return error handled function
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}