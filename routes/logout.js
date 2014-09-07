/**
 * Created by max on 30.10.13.
 */


exports.logout = function (req, res) {
    res.cookie('at', null, { expires: new Date(Date.now() - 90000000), httpOnly: true, signed: true });
    res.redirect('/');
};