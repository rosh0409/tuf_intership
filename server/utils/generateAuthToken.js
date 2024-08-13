import jwt from "jsonwebtoken";

export const generateAuthToken = (email, time) => {
  try {
    let token = jwt.sign({ email: email }, process.env.JWTSECRETKEY, {
      expiresIn: time,
    });
    return token;
  } catch (error) {
    return new Error(error.message);
  }
};
