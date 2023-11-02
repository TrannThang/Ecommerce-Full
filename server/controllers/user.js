const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const makeToken = require("uniqid");
const { users } = require("../utils/constant");
const { log } = require("console");

// const register = asyncHandler(async (req, res) => {
//   const { email, password, firstName, lastName } = req.body;
//   if (!email || !password || !firstName || !lastName)
//     return res.status(400).json({
//       success: false,
//       mes: "Missing inputs",
//     });
//   const user = await User.findOne({ email });
//   if (user) throw new Error("User has existed");
//   else {
//     const newUser = await User.create(req.body);
//     return res.status(200).json({
//       success: newUser ? true : false,
//       mes: newUser
//         ? "Register is successfully.Please go login"
//         : "Something went wrong",
//     });
//   }
// });
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, mobile } = req.body;
  if (!email || !password || !firstName || !lastName || !mobile)
    return res.status(400).json({
      success: false,
      mes: "Missing inputs",
    });
  const user = await User.findOne({ email });
  if (user) throw new Error("User has existed");
  else {
    const token = makeToken();
    const emailEdited = btoa(email) + "@" + token;
    const newUser = await User.create({
      email: emailEdited,
      password,
      firstName,
      lastName,
      mobile,
    });

    if (newUser) {
      const html = `<h2>Register code:</h2><br/><blockquote>${token}</blockquote>`;
      await sendMail({
        email,
        html,
        subject: "Confirm register account in Digital World",
      });
    }
    return res.json({
      success: newUser ? true : false,
      mes: newUser
        ? "Please check your email to active account"
        : "Something went wrong please try later",
    });
  }
});
const finalRegister = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const notActivedEmail = await User.findOne({ email: new RegExp(`${token}`) });
  if (notActivedEmail) {
    notActivedEmail.email = atob(notActivedEmail?.email?.split("@")[0]);
    notActivedEmail.save();
  }
  setTimeout(async () => {
    await User.deleteOne({ email: emailEdited });
  }, [300000]);
  return res.json({
    success: notActivedEmail ? true : false,
    mes: notActivedEmail
      ? "Register is successfully please"
      : "Something went wrong please try later",
  });

  // const newUser = await User.create({
  //   email: cookie?.dataregister?.email,
  //   password: cookie?.dataregister?.password,
  //   mobile: cookie?.dataregister?.mobile,
  //   firstName: cookie?.dataregister?.firstName,
  //   lastName: cookie?.dataregister?.lastName,
  // });
  // res.clearCookie("dataregister");
  // if (newUser) {
  //   return res.redirect(`${process.env.CLIENT_URL}/finalregister/success`);
  // } else return res.redirect(`${process.env.CLIENT_URL}/finalregister/failed`);
});

//Refresh token => Cấp mới access token
// Access token => Xác thực người dùng,phân quyền người dùng
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      success: false,
      mes: "Missing inputs",
    });
  const response = await User.findOne({ email });
  if (response && (await response.isCorrectPassword(password))) {
    // Tách password và role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject();
    //Taọ access token
    const accessToken = generateAccessToken(response._id, role);
    //tạo refresh token
    const newRefreshToken = generateRefreshToken(response._id);
    // Lưu refresh token vào database
    await User.findByIdAndUpdate(
      response._id,
      { refreshToken: newRefreshToken },
      { new: true }
    );
    // Lưu refresh token vào cookies
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const user = await User.findById(_id)
    .select(" -refreshToken -password ")
    .populate({
      path: "cart",
      populate: {
        path: "product",
        select: "title thumb price",
      },
    });
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "User not found",
  });
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies;
  // Check xem có token hay k
  if (!cookie && !cookie.refreshToken)
    throw new Error("No refresh token in cookies");
  // Check token có còn hạn hay k
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : "Refresh token not matched",
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies");
  // Xóa refresh token db
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  // Xóa refresh token ở cookies trình duyệt
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    mes: "Logout is done",
  });
});
// Client gửi email mà họ đăng kí
// Server check mail đó có hợp lệ hay k=> Gửi mail + kèm theo link (password change )
// Client check mail và click link
// Client sẽ gửi api kèm theo token
// Check token có giống token server gửi mail hay k
// Change password

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("Missing email");
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const resetToken = user.createPasswordChangedToken();
  await user.save();

  const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ.<a href=${process.env.CLIENT_URL}/reset-password/${resetToken}>Click here</a>`;
  const data = {
    email,
    html,
    subject: "Forgot password",
  };
  const rs = await sendMail(data);
  return res.status(200).json({
    success: rs.response?.includes("OK") ? true : false,
    mes: rs.response?.includes("OK")
      ? "Check your email please"
      : "Something went wrong.Please try later",
  });
});
const resetPassWord = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) throw new Error("Missing Input");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Invalid reset token");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangeAt = Date.now();
  user.passwordResetExpires = undefined;
  await user.save();
  return res.status(200).json({
    success: user ? true : false,
    mes: user ? "Updated password" : "Something went wrong",
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  // Tách các trường dac biệt ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  //Format lại các operators cho đúng cú pháp của mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString?.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  //Filtering
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };

  if (req.query.q) {
    delete formatedQueries.q;
    formatedQueries["$or"] = [
      { firstName: { $regex: req.query.q, $options: "i" } },
      { lastName: { $regex: req.query.q, $options: "i" } },

      {
        email: { $regex: req.query.q, $options: "i" },
      },
    ];
  }

  let queryCommand = User.find(formatedQueries);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }
  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join("");
    queryCommand = queryCommand.select(fields);
  }

  //Pagination
  //limit:số object lấy về mỗi lần gọi API
  // skip: 2
  // document : 1 2 3 ...10
  // +dffdd=>NaN
  const page = +req.query.page || 1;
  const limit = req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  // Excecute query
  // Số lượng thỏa mãn điều kiện khác với số lượng sp trả về 1 lần gọi api
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await User.find(formatedQueries).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      users: response ? response : "Cannot get Product",
    });
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;

  const response = await User.findByIdAndDelete(uid);
  return res.status(200).json({
    success: response ? true : false,
    mes: response
      ? `User with email ${response.email} deleted`
      : "No user delete",
  });
});
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { firstName, lastName, email, mobile } = req.body;
  const data = { firstName, lastName, email, mobile };
  if (req.file) data.avatar = req.file.path;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("Missing Input");
  const response = await User.findByIdAndUpdate(_id, data, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Updated" : "Something went wrong",
  });
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Missing Input");
  const response = await User.findByIdAndUpdate(uid, req.body, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Updated" : "Something went wrong",
  });
});

const updateUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!req.body.address) throw new Error("Missing Input");
  const response = await User.findByIdAndUpdate(
    _id,
    { $push: { address: req.body.address } },
    {
      new: true,
    }
  ).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? response : "Something went wrong",
  });
});

const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, quantity = 1, color, price, thumbnail, title } = req.body;
  if (!pid || !quantity || !color) throw new Error("Missing Input");
  const user = await User.findById(_id).select("cart");
  const alreadyProduct = user?.cart?.find(
    (el) => el.product.toString() === pid && el.color === color
  );
  console.log(alreadyProduct);
  if (alreadyProduct) {
    if (alreadyProduct.color === color) {
      const response = await User.updateOne(
        {
          cart: {
            $elemMatch: alreadyProduct,
          },
        },
        {
          $set: {
            "cart.$.quantity": quantity,
            "cart.$.price": price,
            "cart.$.thumbnail": thumbnail,
            "cart.$.title": title,
          },
        },
        {
          new: true,
        }
      );
      return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? "Updated your cart" : "Something went wrong",
      });
    }
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          cart: {
            product: pid,
            quantity,
            color,
            price,
            thumbnail,
            title,
          },
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      updatedUser: response ? "Updated your cart" : "Something went wrong",
    });
  }
});

const removeProductInCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, color } = req.params;
  const user = await User.findById(_id).select("cart");
  const alreadyProduct = user?.cart?.find(
    (el) => el?.product?.toString() === pid && el.color === color
  );
  if (!alreadyProduct)
    return res.status(200).json({
      success: true,
      mes: "Updated your cart",
    });
  const response = await User.findByIdAndUpdate(
    _id,
    {
      $pull: {
        cart: {
          product: pid,
        },
      },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? "Updated your cart" : "Something went wrong",
  });
});

const createUsers = asyncHandler(async (req, res) => {
  const response = await User.create(users);
  return res.status(200).json({
    success: response ? true : false,
    users: response ? response : "Something went wrong",
  });
});

module.exports = {
  register,
  createUsers,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassWord,
  getUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
  updateUserAddress,
  updateCart,
  finalRegister,
  removeProductInCart,
};
