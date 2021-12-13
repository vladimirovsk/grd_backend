module.exports = (container) => {
    // Add schedule runner
    require('../jobs')(container);
}