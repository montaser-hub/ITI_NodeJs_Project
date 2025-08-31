import User from "../Models/userModel.js";
import catchError from "../Middelwares/catchError.js";
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";
import AppError from "../Utils/appError.js";

/**** Normal User Functions ****/
export const getMe = catchError(async (req, res, next) => {
  const currentUserId = req.user.id;

  const user = await findeUserById(currentUserId, next);
  res.status(200).json({ user });
});

export const updateMe = catchError(async (req, res, next) => {
  const updateFields = {
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    photo: req.body.photo,
  };
  await findeUserById(req.user.id, next);
  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ user });
});

export const deleteMe = catchError(async (req, res, next) => {
  await findeUserById(req.user.id, next);
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ message: "User deactivated" });
});

/****Admin Functions******/
export const getAllUsers = catchError(async (req, res, next) => {
  const query = req.query;
  const filter = filterQuery(query);
  const { skip, limit } = paginateQuery(query);
  const sort = sortQuery(query);

  const users = await User.find(filter).skip(skip).limit(limit).sort(sort); //{name:montaser,age:29}

  const total = await User.countDocuments(filter);

  res
    .status(200)
    .json({ total, page: query.page, limit: query.limit, data: users });
});

export const getUserById = catchError(async (req, res, next) => {
  const user = await findeUserById(req.params.id, next);
  res.status(200).json({ user });
});

export const createUser = catchError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ newUser });
});

export const updateUser = catchError(async (req, res, next) => {
  await findeUserById(req.params.id, next);
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ user });
});

export const deleteUser = catchError(async (req, res, next) => {
  await findeUserById(req.params.id, next);
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({ message: "User deactivated" });
});

async function findeUserById(id, next) {
  const user = await User.findById(id); //.lean();
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  return user;
}
