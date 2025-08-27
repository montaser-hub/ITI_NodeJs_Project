import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    photo: {
      type: String,
      default: "../Uploads/users/default.jpg",
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: true,
      validate: {
        //use validate property to check if passwordConfirm is same as password
        validator: function (el) {
          //use callback function to access this.password when new user is created and its only works on create and save
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//middleware to encrypt password before saving if the password has actually been modified or is new
/**Because in case the user update his email so why i need to encrypt pass again !! **/
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //no longer need to store passwordConfirm in DB
  this.passwordConfirm = undefined; //delete passwordConfirm field
  next();
});
//middleware to set passwordChangedAt property for the user
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // saving to DB is sometimes slower than creating the token so to avoid that we set passwordChangedAt a bit in the past
  this.passwordChangedAt = Date.now() - 1000; //-1000 to make sure that the token is always created after the password has been changed
  next();
});
//create method to compare password for login(instance method: that can be used on all documents of a certain collection )
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); //return true or false
};

// instance method to check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //True means changed(day or the time at which token is issued is greater than the change timestamp)
    //False means Not changed(day or the time at which token is issued is less than the change timestamp)
    return JWTTimestamp < changedTimestamp;
  }

  //False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); //generate random token

  //encrypt the token to store it in DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set expiration time for the token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
