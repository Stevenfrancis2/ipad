// authMiddleware.js

const excludedRoutes = [
    '/login',
    '/',
    '/AdminPanel/Login',
    '/delivery',
    '/markets',
    '/beachbars',
    '/desserts',
    '/beauty',
    '/shops',
    '/transportations',
    '/gaming',
    '/contact',
    '/info',
    '/addReview',
  ];
  
  const checkAdminAuth = (req, res, next) => {
    if (excludedRoutes.includes(req.path)) {
      // Route is in the excluded list, proceed to the next middleware or route handler
      next();
    } else if (req.session.isAdminLoggedIn) {
      // Admin is logged in, proceed to the next middleware or route handler
      next();
    } else {
      // Admin is not logged in, redirect to the login page
      res.redirect('/login');
    }
  };
  
  module.exports = {
    checkAdminAuth
  };
  