import User from "../Models/userModel.js";
import catchAsync from "../Middelwares/catchAsync.js";
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";
/**** Normal User Functions ****/
export const getMe = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;

  const user = await findeUserById(currentUserId);
  res.status(200).json({ user });
});

export const updateMe = catchAsync(async (req, res) => {
  const updateFields = {
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    photo: req.body.photo,
  };
  await findeUserById(req.user.id);
  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ user });
});

export const deleteMe = catchAsync(async (req, res) => {
  await findeUserById(req.user.id);
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ message: "User deactivated" });
});

/****Admin Functions******/
export const getAllUsers = catchAsync(async (req, res) => {
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

export const getUserById = catchAsync(async (req, res) => {
  const user = await findeUserById(req.params.id);
  res.status(200).json({ user });
});

export const createUser = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ newUser });
});

export const updateUser = catchAsync(async (req, res) => {
  await findeUserById(req.params.id);
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ user });
});

export const deleteUser = catchAsync(async (req, res) => {
  await findeUserById(req.params.id);
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({ message: "User deactivated" });
});


