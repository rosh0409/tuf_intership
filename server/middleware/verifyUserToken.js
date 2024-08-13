import jwt from "jsonwebtoken";

export const verifyUserToken = async (req, res, next) => {
  try {
    if (!req.headers?.cookie) {
      return res.status(400).json({
        status: "failed",
        message: "Not a verified user",
      });
    }
    const token = req.headers?.cookie.split("=")[1];
    jwt.verify(token, process.env.JWTSECRETKEY, (err, user) => {
      if (err) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid Token",
        });
      }
      req.email_token = user.email;
    });
  } catch (error) {
    return res.json({
      status: "failed",
      message: `${error.message}`,
    });
  }
  next();
};
