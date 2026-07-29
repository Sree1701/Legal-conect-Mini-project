const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access Denied: No Token Provided",
        });
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trim();
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "LegalConnectSecret123");
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Invalid or Expired Token",
        });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Administrative access required.",
        });
    }
    next();
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;