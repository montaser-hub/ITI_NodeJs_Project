/****** to automate the token within postman use Test to set an env variables pm.environment.set("token"--> the variable that you name it at post man, pm.reponse.json().token--> property name as you name it) at signup and login*******/
import { promisify } from "util"; //use Node.js built-in util module.
import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import catchAsync from "../Middelwares/catchAsync.js";
import sendEmail from "../Utils/Email.js";
import crypto from "crypto";

//function to sign token with user id as payload and secret from env file and expires in also from env file to follow DRY principle
export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
export const signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const verifyToken = signToken(newUser._id);
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/confirm/${verifyToken}`;
  sendEmail(verifyURL, newUser.email);

  res.status(201).json({
    status: "success",
    verifyToken,
    data: {
      user: newUser,
    },
  });
});

export const verifyAccount = catchAsync(async (req, res, next) => {
  // 1) Verify token (use promisify to await jwt.verify)
  const decoded = await promisify(jwt.verify)(
    req.params.token, // token passed in URL param
    process.env.JWT_SECRET
  );

  // 2) Find the user by decoded email
  const user = await User.findOne({ _id: decoded.id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // 3) Update user's account status
  user.isConfirmed = true;
  await user.save({ validateBeforeSave: false });
  // 4) Respond
  res.status(200).json({
    status: "success",
    message: "Account verified successfully",
    user,
  });
});

export const login = catchAsync( async ( req, res, next ) => {
  const { email, password } = req.body;
  //1) Check if email and password exist
  if (!email || !password) {
    return next(new Error("Please provide email and password!"));
  }
  //2) Check if user exists && password is correct
  const user = await User.findOne( { email } ).select("+password"); //to select the password field which has select: false in userModel
  //3) check if user is confirmed
  if (!user || !user?.isConfirmed) {
    return res.status(403).json({ message: "Please verify your account" });
  }
  //4) check if user is active
  if (!user.active) {
    return res
      .status(403)
      .json({ message: "User is deactivated, please contact support" });
  }
  //5) check if password is correct by using instance method from userModel
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Error("Incorrect email or password"));
  }

  //6) If everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

export const logout = (req, res) => {
  //add below for production with https
  //res.cookie("jwt", "loggedout", {
  // httpOnly: true,
  // expires: new Date(Date.now() + 1 * 1000), // expires instantly
  //});
  // add this code to work with pot man test in logout route
  /*
    if (pm.response.json().clearToken) {
    pm.environment.unset("token");
    } 
    */

  res.status(200).json({
    status: "success",
    message: "You have been logged out successfully",
    clearToken: true,
  });
};

export const protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new Error("You are not logged in! Please log in to get access.", 401)
    );
  }

  //2) Verification token where we use promisify as work around to convert callback function to promise function so we can use await with it and jwt.verify to verify the token with secret key from env file
  /*
  | Feature                      | **`jwt.decode(token)`**                                                                    | **`await promisify(jwt.verify)(token, secret)`**                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Purpose**                  | Just extracts payload (header & body)                                                      | Verifies token integrity + returns payload                                                  |
| **Signature verification**   | ❌ No verification (anyone can fake the token)                                              | ✅ Verifies token signature using secret/public key                                          |
| **Expiration check (`exp`)** | ❌ Not enforced (you can still see `exp` value, but it won’t throw error)                   | ✅ Enforced (throws `TokenExpiredError` if expired)                                          |
| **Use case**                 | - Debugging<br>- Logging<br>- Reading non-sensitive claims<br>- Checking payload structure | - Authentication middleware<br>- Authorization checks<br>- Securely trusting token contents |
| **Error handling**           | Returns `null` if invalid format                                                           | Throws error if invalid/expired (`JsonWebTokenError`, `TokenExpiredError`)                  |
| **Async/Await support**      | No need (synchronous)                                                                      | Needs `promisify` to use with `await`                                                       |
| **Return value**             | Decoded payload (or `null`)                                                                | Decoded payload (if valid)                                                                  |
| **Security**                 | ⚠️ Insecure — never trust in production                                                    | ✅ Secure — safe to use in production                                                        |

  1. jwt.verify

        What it does:

        Verifies the token’s signature using your secret key (or public key if using RS256, etc.).

        Ensures the token is not expired and has not been tampered with.

        If verification succeeds → returns the decoded payload.

        If verification fails → throws an error (like JsonWebTokenError, TokenExpiredError, etc.).

        Why promisify(jwt.verify):

        By default, jwt.verify works with callbacks:

        jwt.verify(token, secret, (err, decoded) => { ... });


        To use await/async, you wrap it with util.promisify:

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


        ✅ Safe for authentication/authorization because it actually validates integrity.

        2. jwt.decode

        What it does:

        Just decodes the token payload (header + body).

        Does NOT verify the signature.
        → Anyone could give you a forged/modified token, and decode would still return the payload.

        Useful for:

        Debugging tokens.

        Extracting non-sensitive info (e.g., iat, exp) before verification.

        Checking expiry time in a UI without requiring the secret.

        Example:

        const decoded = jwt.decode(token);
        console.log(decoded); // { id: '123', iat: ..., exp: ... }


        ❌ Not safe for auth → never trust decode results for authorization decisions.

        ✅ So when to use which?

        Use jwt.verify (with promisify + await) → for auth middleware and anywhere you must trust the token.

        Use jwt.decode → only for reading the payload without caring about validity (e.g., UI, debugging, logging).

        👉 In short:

        jwt.verify = checks authenticity + returns payload (secure).

        jwt.decode = just extracts payload (insecure, no verification).
    */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // convert to promise-based

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new Error("The user belonging to this token does no longer exist.", 401)
    );
  }

  //4) Check if user changed password after the token was issued (replace with instance method in userModel)
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new Error("User recently changed password! Please log in again.", 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; //to make user data available in the next middleware
  next();
});

//middleware to restrict access based on roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const forgetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Error("There is no user with email address.", 404));
  }
  //2) Generate the random reset token
  const resetToken = await user.createPasswordResetToken(); //instance method from userModel
  const us1er = await user.save( { validateBeforeSave: false } ); //save the user document with the new fields without running validators
  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;
  try {
    await sendEmail(resetURL, user.email, false);

    res.status(200).json({
      status: "success",
      message: "reset request sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new Error("There was an error sending the email. Try again later!", 500)
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, //check if token is not expired
  });
  //2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new Error("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //to run the validators
  //3) Update changedPasswordAt property for the user
  //handled in userModel pre save middleware
  //4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});


export const updateMyPassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select("+password"); //to select the password field which has select: false in userModel
  //2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new Error("Your current password is wrong.", 401));
  }
  //3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); //we use save not findByIdAndUpdate to make sure that the pre save middleware in userModel is applied to encrypt the new password
  //4) Log user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});