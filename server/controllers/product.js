const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const makeSKU = require("uniqid");

const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category, color } = req.body;
  const thumb = req.files?.thumb[0].path;
  const images = req.files?.images?.map((el) => el.path);

  if (!(title && price && description && brand && category && color))
    throw Error("Missing Input");
  req.body.slug = slugify(title);
  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;

  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: newProduct ? true : false,
    mes: newProduct ? " Created" : "Failed.",
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid).populate({
    path: "rating",
    populate: {
      path: "postedBy",
      select: "firstName lastName avatar",
    },
  });
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
  queryString = queryString?.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);
  let colorQueryObject = {};

  if (queries?.title)
    formatedQueries.title = { $regex: queries.title, $options: "i" };
  if (queries?.category)
    formatedQueries.category = { $regex: queries.category, $options: "i" };
  if (queries?.color) {
    delete formatedQueries.color;
    const colorArr = queries.color?.split(",");
    const colorQuery = colorArr.map((el) => ({
      color: { $regex: el, $options: "i" },
    }));
    colorQueryObject = { $or: colorQuery };
  }
  let queryObject = [];
  if (queries?.q) {
    delete formatedQueries.q;
    queryObject = {
      $or: [
        {
          color: { $regex: queries.q, $options: "i" },
        },
        {
          title: { $regex: queries.q, $options: "i" },
        },
        {
          category: { $regex: queries.q, $options: "i" },
        },
        {
          brand: { $regex: queries.q, $options: "i" },
        },
        {
          description: { $regex: queries.q, $options: "i" },
        },
      ],
    };
  }
  const qr = { ...colorQueryObject, ...formatedQueries, ...queryObject };

  let queryCommand = Product.find(qr);

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
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  // Excecute query
  // Số lượng thỏa mãn điều kiện khác với số lượng sp trả về 1 lần gọi api
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await Product.find(qr).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      products: response ? response : "Cannot get Product",
    });
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const files = req?.files;
  if (files?.thumb) req.body.thumb = files[0]?.thumb[0].path;
  if (files?.images) req.body.images = files.images?.map((el) => el.path);

  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    mes: updatedProduct ? "Updated" : "Cannot update Product",
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findOneAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    msg: deletedProduct ? "Deleted" : "Cannot delete Product",
  });
});

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid, updatedAt } = req.body;
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
          "rating.$.updatedAt": updatedAt,
        },
      }
    );
  } else {
    //add star & comment
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: {
          rating: { star, comment, postedBy: _id, updatedAt },
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
    success: true,
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
    success: response ? true : false,
    updatedProduct: response ? response : "Cannot upload images product",
  });
});

const addVariant = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, price, color } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req?.files?.images?.map((el) => el.path);

  if (!(title && price && color)) throw Error("Missing Input");

  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: {
        variants: {
          color,
          price,
          title,
          thumb,
          images,
          sku: makeSKU().toUpperCase(),
        },
      },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Added variant" : "Cannot upload images product",
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
  addVariant,
};
