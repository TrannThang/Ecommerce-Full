import React, { useState } from "react";
import { formatMoney } from "../utils/helpers";
import label from "../assets/new.png";
import trending from "../assets/trending.png";
import { renderStarFromNumber } from "../utils/helpers";
import { SelectOption } from "./";
import icons from "../utils/icons";
import { Link } from "react-router-dom";
import path from "../utils/path";

const { AiFillEye, IoMdMenu, BsFillSuitHeartFill } = icons;

const Product = ({ productData, isNew, normal }) => {
  const [isShowOption, setIsShowOption] = useState(false);
  return (
    <div className="w-full text-base  px-[10px]">
      <Link
        className="border w-full p-[15px] flex flex-col items-center"
        to={`/${productData?.category?.toLowerCase()}/${productData?._id}/${
          productData?.title
        }`}
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
              <SelectOption icon={<AiFillEye />} />
              <SelectOption icon={<IoMdMenu />} />
              <SelectOption icon={<BsFillSuitHeartFill />} />
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
      </Link>
    </div>
  );
};

export default Product;
