import React, { useCallback, useEffect, useState } from "react";
import { CustomizeVatiants, InputForm, Pagination } from "components";
import { useForm } from "react-hook-form";
import { apiGetProducts, apiDeleteProduct } from "apis/product";
import moment from "moment";
import UpdateProducts from "./UpdateProducts";
import {
  useSearchParams,
  createSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import useDebounce from "hooks/useDebounce";
import Swal from "sweetalert2";
import { BiEdit, BiCustomize } from "react-icons/bi";
import { CiSquareRemove } from "react-icons/ci";

const ManageProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();
  const [products, setProducts] = useState(null);
  const [counts, setCounts] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  const [update, setUpdate] = useState(false);
  const [customizeVariants, setCustomizeVariants] = useState(null);

  const render = useCallback(() => {
    setUpdate(!update);
  });

  const fetchProducts = async (params) => {
    const response = await apiGetProducts({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setCounts(response.counts);
      setProducts(response.products);
    }
  };
  const queryDebounce = useDebounce(watch("q"), 800);
  useEffect(() => {
    if (queryDebounce) {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: queryDebounce }).toString(),
      });
    } else {
      navigate({
        pathname: location.pathname,
      });
    }
  }, [queryDebounce]);
  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);

    fetchProducts(searchParams);
  }, [params, update]);

  const handleDeleteProduct = (pid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure  you sure remove this product",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {editProduct && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50">
          <UpdateProducts
            editProduct={editProduct}
            render={render}
            setEditProduct={setEditProduct}
          />
        </div>
      )}
      {customizeVariants && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50">
          <CustomizeVatiants
            customizeVariants={customizeVariants}
            render={render}
            setCustomizeVariants={setCustomizeVariants}
          />
        </div>
      )}

      <div className="h-[69px] w-full"></div>
      <div className="px-4 border-b bg-gray-100 w-full flex justify-between items-center fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight border-b">
          Manage Products
        </h1>
      </div>
      <div className="flex  justify-end items-center px-4">
        <form className="w-[45%]">
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="Search products by title,description,vv"
          />
        </form>
      </div>
      <table className="table-auto pl-8">
        <thead>
          <tr className="border bg-sky-900 text-white border-white ">
            <th className="text-center py-2">Order</th>
            <th className="text-center py-2">Thumb</th>
            <th className="text-center py-2">Title</th>
            <th className="text-center py-2">Brand</th>
            <th className="text-center py-2">Category</th>
            <th className="text-center py-2">Price</th>
            <th className="text-center py-2">Quantity</th>
            <th className="text-center py-2">Sold</th>
            <th className="text-center py-2">Color</th>
            <th className="text-center py-2">Ratings</th>
            <th className="text-center py-2">Variants count</th>
            <th className="text-center py-2">UpdateAt</th>
            <th className="text-center py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((el, idx) => (
            <tr className="border-b" key={el._id}>
              <td className="text-center py-2">
                {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                  process.env.REACT_APP_LIMIT +
                  idx +
                  1}
              </td>
              <td className="text-center py-2">
                <img
                  src={el.thumb}
                  alt="thumb"
                  className="w-12 h-12 object-cover"
                />
              </td>
              <td className="text-center py-2">{el.title}</td>
              <td className="text-center py-2">{el.brand}</td>
              <td className="text-center py-2">{el.category}</td>
              <td className="text-center py-2">{el.price}</td>
              <td className="text-center py-2">{el.quantity}</td>
              <td className="text-center py-2">{el.sold}</td>
              <td className="text-center py-2">{el.color}</td>
              <td className="text-center py-2">{el.totalRating}</td>
              <td className="text-center py-2">{el.variants?.length || 0}</td>
              <td className="text-center py-2">
                {moment(el.createAt).format("DD/MM/YYYY")}
              </td>
              <td className="text-center py-2">
                <span
                  onClick={() => setEditProduct(el)}
                  className="text-blue-500 hover:text-orange-600 inline-block hover:underline cursor-pointer px-1"
                >
                  <BiEdit size={20} />
                </span>
                <span
                  onClick={() => handleDeleteProduct(el._id)}
                  className="text-blue-500 hover:text-orange-600 inline-block hover:underline cursor-pointer px-1"
                >
                  <CiSquareRemove size={20} />
                </span>
                <span
                  onClick={() => setCustomizeVariants(el)}
                  className="text-blue-500 hover:text-orange-600 inline-block hover:underline cursor-pointer px-1"
                >
                  <BiCustomize size={20} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-full flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
};

export default ManageProducts;
