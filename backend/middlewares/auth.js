const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');


const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res, next) => {
    console.error("Clerk Auth Error:", err.message);
    res.status(401).json({ success: false, message: 'Unauthorized / Invalid Token' });
  }
});

module.exports = requireAuth;