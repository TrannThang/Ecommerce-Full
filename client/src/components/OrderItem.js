import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { formatMoney } from "utils/helpers";
import SelectQuantity from "./SelectQuantity";
import { updateCart } from "store/user/userSlice";
import withBaseComponent from "hocs/withBaseComponent";

const OrderItem = ({
  dispatch,
  pid,
  color,
  dfQuantity = 1,
  title,
  thumbnail,
  price,
}) => {
  const [quantity, setQuantity] = useState(() => dfQuantity);
  const handleQuantity = (number) => {
    if (+number > 1) setQuantity(number);
  };
  const handleChangeQuantity = (flag) => {
    if (flag === "minus" && quantity === 1) return;
    if (flag === "minus") setQuantity((prev) => +prev - 1);
    if (flag === "plus") setQuantity((prev) => +prev + 1);
  };
  useEffect(() => {
    dispatch(updateCart({ pid, quantity, color }));
  }, [quantity]);

  return (
    <div className="w-main mx-auto border-b font-bold py-3  grid grid-cols-10">
      <span className="col-span-6 w-full text-center">
        <div className="flex gap-2 px-4 py-3">
          <img src={thumbnail} alt="thumb" className="w-28 h-28 object-cover" />
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-main">{title}</span>
            <span className="text-[10px] font-main">{color}</span>
          </div>
        </div>
      </span>
      <span className="col-span-1 w-full text-center">
        <div className="flex items-center h-full">
          <SelectQuantity
            quantity={quantity}
            handleQuantity={handleQuantity}
            handleChangeQuantity={handleChangeQuantity}
          />
        </div>
      </span>
      <span className="col-span-3 w-full h-full flex justify-center  items-center text-center">
        <span className="text-lg">{formatMoney(price * quantity) + "VNĐ"}</span>
      </span>
    </div>
  );
};

export default withBaseComponent(OrderItem);
