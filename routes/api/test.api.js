const router = require('express').Router();

/**
 * @description test routes
 */
router.get('/connection', function (req, res, next) {
    res.json({isServerWorks: true});
});

module.exports = router;