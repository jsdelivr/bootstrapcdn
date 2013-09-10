function birthday(req, res) {
    res.render('birthday', { title: 'Bootstrap CDN', theme: req.query.theme });
}

module.exports = {
    birthday: birthday
};
