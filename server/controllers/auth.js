const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const ms = require("ms");

const { clearTokens, generatedJWT } = require("../utils/auth");
const { users, tokens } = require("../data/data");

exports.signUp = async (req, res, next) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(422).json({
      error: "please fill all the required fields",
    });
  }
  try {
    const userAlreadyExists = users.find((user) => {
      if (user.userName === username || user.email === email) {
        return true;
      }
      return false;
    });
    const newUser = {
      id: users[users.length - 1].id,
      name: name,
      email: email,
      password: password,
      username: username,
    };

    users.push(newUser);
    req.userId = newUser.id;
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(422).json({
        error: "please fill all the required fields",
      });
    }
    const user = users.find((user) => {
      if (user.userName === username || user.email === username) {
        return true;
      }
    });
    if (!user) {
      const error = createError.Unauthorized("Invalid username or passwoed ");
      throw error;
    }
    const passwordsMatch = user.password == password;

    if (!passwordsMatch) {
      const error = createError.Unauthorized("Invalid username or Password");
      throw error;
    }
    req.userId = user.id;
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  await clearTokens(req, res, next);
  return res.status(204);
};

exports.refreshAccessToken = async (req, res, next) => {
  const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE } = process.env;
  const { signedCookies } = req;
  const { refreshToken } = signedCookies;
  if (!refreshToken) {
    return res.sendStatus(204);
  }
  try {
    const refreshTokenInDB = tokens.find((token) => token.refreshToken == refreshToken)?.refreshToken;
    if (!refreshTokenInDB) {
      await clearTokens(req, res, next);
      const error = createError.Unauthorized();
      throw error;
    }
    try {
      const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const { userId } = decodedToken;
      const user = users.find((user) => user.id == userId);
      if (!user) {
        await clearTokens(req, res);
        const error = createError("Invalid credentials", 401);
        throw error;
      }
      const accessToken = generatedJWT(user.id, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE);
      return res.status(200).json({
        user,
        accessToken,
        expireAt: new Date(Date.now() + ms(ACCESS_TOKEN_LIFE)),
      });
    } catch (error) {
      return next(error);
    }
  } catch (error) {
    return next(error);
  }
};
