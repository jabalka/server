function parseError(err) {
    if (err.name === 'ValidationError' && err.errors) {
        return Object.values(err.errors).map(e => e.properties.message).join(' \n');
    } else if (err.message) {
        return err.message;
    } else {
        return 'An unknown error occurred';
    }
}

module.exports = {
    parseError
};