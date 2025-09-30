import express from "express";
import {
  signup,
  verifyAccount,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  updateMyPassword,
  logout,
} from "../Controllers/authController.js";
import {
  getMe,
  updateMe,
  deleteMe,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../Controllers/userController.js";
import validationMiddleware from "../Middelwares/validation.js";
import {
  userCreateSchema,
  userUpdateSchema,
  userUpdatePassSchema,
} from "../Utils/Validation/userValidation.js";

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management & authentication
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         age:
 *           type: number
 *         photo:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         active:
 *           type: boolean
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User successfully registered
 */
userRouter.post("/signup", validationMiddleware(userCreateSchema), signup);

/**
 * @swagger
 * /users/confirm/{token}:
 *   put:
 *     summary: Verify user account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Account verified
 */
userRouter.put("/confirm/:token", verifyAccount);

/**
 * @swagger
 * /users/signin:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
userRouter.post("/signin", login);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
userRouter.post("/logout", logout);

/**
 * @swagger
 * /users/forgetPassword:
 *   post:
 *     summary: Request password reset
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Reset link sent to email
 */
userRouter.post("/forgetPassword", forgetPassword);

/**
 * @swagger
 * /users/resetPassword/{token}:
 *   put:
 *     summary: Reset password with token
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Password successfully reset
 */
userRouter.put("/resetPassword/:token", resetPassword);

/**
 * @swagger
 * /users/updateMyPassword:
 *   put:
 *     summary: Update current user password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
userRouter.put(
  "/updateMyPassword",
  protect,
  validationMiddleware(userUpdatePassSchema),
  updateMyPassword
);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile returned
 */
userRouter.get("/me", protect, getMe);

/**
 * @swagger
 * /users/updateMe:
 *   put:
 *     summary: Update current user details
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User updated successfully
 */
userRouter.put(
  "/updateMe",
  protect,
  validationMiddleware(userUpdateSchema),
  updateMe
);

/**
 * @swagger
 * /users/deleteMe:
 *   delete:
 *     summary: Deactivate current user account
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User deactivated
 */
userRouter.delete("/deleteMe", protect, deleteMe);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 */
userRouter
  .route("/")
  .get(protect, restrictTo("admin"), getAllUsers)
  .post(
    protect,
    validationMiddleware(userCreateSchema),
    restrictTo("admin"),
    createUser
  );

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 */
userRouter
  .route("/:id")
  .put(
    protect,
    validationMiddleware(userUpdateSchema),
    restrictTo("admin"),
    updateUser
  )
  .get(protect, restrictTo("admin"), getUserById)
  .delete(protect, restrictTo("admin"), deleteUser);

export default userRouter;
