const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw Error("Missing Input");
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: newProduct ? true : false,
    createdProduct: newProduct ? newProduct : "Cannot create new Product",
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid);
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get Product",
  });
});

// Filtering,sorting and pagination
const getProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  // Tách các trường dac biệt ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  //Format lại các operators cho đúng cú pháp của mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  //Filtering
  if (queries?.title)
    formatedQueries.title = { $regex: queries.title, $options: "i" };
  let queryCommand = Product.find(formatedQueries);

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
    const counts = await Product.find(formatedQueries).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      products: response ? response : "Cannot get Product",
    });
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct ? updatedProduct : "Cannot update Product",
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findOneAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : "Cannot delete Product",
  });
});

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid } = req.body;
  if (!star || !pid) throw new Error("Missing inputs");
  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.rating?.find(
    (el) => el.postedBy.toString() === _id
  );
  if (alreadyRating) {
    //update star & comment
    await Product.updateOne(
      {
        rating: {
          $elemMatch: alreadyRating,
        },
      },
      {
        $set: {
          "rating.$.star": star,
          "rating.$.comment": comment,
        },
      }
    );
  } else {
    //add star & comment
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: {
          rating: { star, comment, postedBy: _id },
        },
      },
      { new: true }
    );
  }
  // Sum ratings
  const updatedProduct = await Product.findById(pid);
  const ratingCount = updatedProduct.rating.length;
  const sumRatings = updatedProduct.rating.reduce(
    (sum, el) => sum + +el.star,
    0
  );
  updatedProduct.totalRating = Math.round((sumRatings * 10) / ratingCount) / 10;

  await updatedProduct.save();

  return res.status(200).json({
    status: true,
    updatedProduct,
  });
});
const uploadImagesProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!req.files) throw new Error("Missing inputs");
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((el) => el.path) } },
    },
    { new: true }
  );
  return res.status(200).json({
    status: response ? true : false,
    updatedProduct: response ? response : "Cannot upload images product",
  });
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImagesProduct,
};
