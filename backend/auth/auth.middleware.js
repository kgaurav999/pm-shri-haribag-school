function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Administrator access required.",
    });
  }

  next();
}
function requireAdminForWrite(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  return requireAdmin(req, res, next);
}
module.exports = {
  requireAuth,
  requireAdmin,
  requireAdminForWrite,
};
