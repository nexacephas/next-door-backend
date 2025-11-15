export const adminMiddleware = (req, res, next) => {
  // Ensure we check the same flag used elsewhere (`isAdmin`)
  if (req.user && (req.user.isAdmin === true || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admins only.' });
};
