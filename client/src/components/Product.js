import React, { memo, useState } from "react";
import { formatMoney } from "../utils/helpers";
import label from "../assets/new.png";
import trending from "../assets/trending.png";
import { renderStarFromNumber } from "../utils/helpers";
import { SelectOption } from "./";
import icons from "../utils/icons";
import { Link, createSearchParams } from "react-router-dom";
import path from "../utils/path";
import withBaseComponent from "hocs/withBaseComponent";
import { showModal } from "store/app/appSlice";
import { DetailProduct } from "pages/public";
import { BsCartPlus } from "react-icons/bs";
import { apiUpdateCart } from "apis";
import { toast } from "react-toastify";
import { getCurrent } from "store/user/asyncActions";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { BsFillCartCheckFill, BsFillCartPlusFill } from "react-icons/bs";

const { AiFillEye, IoMdMenu, BsFillSuitHeartFill } = icons;

const Product = ({
  productData,
  isNew,
  normal,
  navigate,
  dispatch,
  location,
}) => {
  const [isShowOption, setIsShowOption] = useState(false);
  const { current } = useSelector((state) => state.user);
  const handleClickOptions = async (e, flag) => {
    e.stopPropagation();
    if (flag === "CART") {
      if (!current)
        return Swal.fire({
          title: "Almost...",
          text: "Please login first",
          icon: "info",
          cancelButtonText: "Not now!",
          showCancelButton: true,
          confirmButtonText: "Go login page",
        }).then(async (rs) => {
          if (rs.isConfirmed) {
            navigate({
              pathname: `/${path.LOGIN}`,
              search: createSearchParams({
                redirect: location.pathname,
              }).toString(),
            });
          }
        });
      const response = await apiUpdateCart({
        pid: productData?._id,
        color: productData?.color,
        quantity: 1,
        price: productData?.price,
        thumbnail: productData?.thumb,
        title: productData?.title,
      });
      if (response.success) {
        toast.success(response.mes);
        dispatch(getCurrent());
      } else {
        toast.error(response.mes);
      }
    }

    if (flag === "WISHLIST") console.log("WISHLIST");
    if (flag === "QUICKVIEW") {
      dispatch(
        showModal({
          isShowModal: true,
          modalChildren: (
            <DetailProduct
              isQuickView
              data={{ pid: productData?._id, category: productData?.category }}
            />
          ),
        })
      );
    }
  };
  return (
    <div className="w-full text-base  px-[10px]">
      <div
        className="border w-full p-[15px] flex flex-col items-center"
        onClick={(e) =>
          navigate(
            `/${productData?.category?.toLowerCase()}/${productData?._id}/${
              productData?.title
            }`
          )
        }
        onMouseEnter={(e) => {
          e.stopPropagation();
          setIsShowOption(true);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          setIsShowOption(false);
        }}
      >
        <div className="w-full relative">
          {isShowOption && (
            <div className="absolute bottom-[-10px] right-0 left-0  flex justify-center gap-2 animate-slide-top">
              <span
                title="Quick view"
                onClick={(e) => handleClickOptions(e, "QUICKVIEW")}
              >
                <SelectOption icon={<AiFillEye />} />
              </span>
              {current?.cart?.some(
                (el) => el.product === productData._id.toString()
              ) ? (
                <span title="Added to cart">
                  <SelectOption icon={<BsFillCartCheckFill color="green" />} />
                </span>
              ) : (
                <span
                  title="Add to cart"
                  onClick={(e) => handleClickOptions(e, "CART")}
                >
                  <SelectOption icon={<BsFillCartPlusFill />} />
                </span>
              )}
              <span
                title="Add to wishlist"
                onClick={(e) => handleClickOptions(e, "WISHLIST")}
              >
                {" "}
                <SelectOption icon={<BsFillSuitHeartFill />} />
              </span>
            </div>
          )}
          <img
            src={
              productData?.thumb ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPnriyZ1TkBrE_AFgrp231IQJ3O0tC0k-IzQ&usqp=CAU"
            }
            alt=""
            className="w-[274px] h-[274px]  object-cover"
          />
          {!normal && (
            <img
              src={isNew ? label : trending}
              alt=""
              className={`absolute w-[100px] h-[35px]  top-[0] right-[0]  object-cover`}
            />
          )}
        </div>
        <div className="flex flex-col  mt-[15px] items-start w-full ">
          <span className="flex h-4">
            {renderStarFromNumber(productData.totalRating)?.map((el, index) => (
              <span key={index}>{el}</span>
            ))}
          </span>
          <span className="line-clamp-1">{productData?.title}</span>
          <span>{`${formatMoney(productData?.price)} VNĐ`}</span>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(Product));
