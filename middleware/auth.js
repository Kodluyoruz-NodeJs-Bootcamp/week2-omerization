import jwt from 'jsonwebtoken';

const config = process.env;

const middleware = {};


//function to check JWT token
middleware.verifyJWTToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    req.flash("error", "Tokenin yok");
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    req.flash("error", "Geçersiz token");
    return res.redirect('/login');
  }
  return next();
};

//function to check if user is logged in
middleware.isLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash("error", "Giriş yapman lazım");
    return res.redirect('/login');
  }
  next();
}


export default middleware;