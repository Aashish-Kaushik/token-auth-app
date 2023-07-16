const createError = require(`http-errors`);
const { users } = require("../data/data");

exports.getUsers = async (req, res, next) => {
  const usersListwithOutpassword = users.map((user) => {
    const { password, ...usersListwithOutpassword } = user;
    return { ...usersListwithOutpassword };
  });
  return res.status(200).json({
    data: usersListwithOutpassword,
  });
};

exports.getAuthenticatedUser = async (req, res, next) => {
  try {
    const { userId } = req;
    const authenticatedUser = users.find((user) => user.id == userId);
    if (authenticatedUser) {
      return res.status(200).json({
        data: authenticatedUser,
      });
    }
    const error = createError.NotFound();
    throw error;
  } catch (error) {
    return next(error);
  }
};

exports.getuserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = users.find((user) => user.id == id);
    if (user) {
      return res.status(200).json({
        data: user,
      });
    }
    const error = createError.NotFound();
    throw error;
  } catch (error) {
    return next(error);
  }
};
