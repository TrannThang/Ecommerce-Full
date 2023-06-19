import React from "react";
import { renderStarFromNumber, formatMoney } from "../utils/helpers";

const ProductCard = ({ price, totalRating, title, image }) => {
  return (
    <div className="w-1/3 flex-auto mb-[20px] px-[10px] ">
      <div className="flex w-full border">
        <img
          src={image}
          alt="products"
          className="w-[120px] object-contain p-4"
        />
        <div>
          <div className="flex flex-col mt-[15px] items-start w-full text-xs ">
            <span className="line-clamp-1 text-sm lowercase capitalize">
              {title?.toLowerCase()}
            </span>
            <span className="flex h-4">
              {renderStarFromNumber(totalRating, 14)?.map((el, index) => (
                <span key={index}>{el}</span>
              ))}
            </span>
            <span>{`${formatMoney(price)} VNĐ`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
