import React, { useState, useEffect, memo } from "react";
import icons from "../utils/icons";
import { apiGetProducts } from "../apis/product";
import {
  renderStarFromNumber,
  formatMoney,
  secondToHms,
} from "../utils/helpers";
import { CountDown } from "./";
import * as moment from "moment";

const { AiFillStar, IoMdMenu } = icons;
let idInterval;

const DealDaily = () => {
  const [dealdaily, setDealdaily] = useState(null);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [expireTime, setExpireTime] = useState(false);

  const fetchDealDaily = async () => {
    const response = await apiGetProducts({
      limit: 1,
      page: Math.round(Math.random() * 10),
      totalRating: 5,
    });
    if (response.success) {
      setDealdaily(response.products[0]);
      const today = `${moment().format("MM/DD/YYYY")} 5:00:00`;
      const seconds =
        new Date(today).getTime() - new Date().getTime() + 24 * 3600 * 1000;
      const number = secondToHms(seconds);

      setHour(number.h);
      setMinute(number.m);
      setSecond(number.s);
    } else {
      setHour(0);
      setMinute(59);
      setSecond(59);
    }
  };
  //   useEffect(() => {
  //     fetchDealDaily();
  //   }, []);
  useEffect(() => {
    idInterval && clearInterval(idInterval);
    fetchDealDaily();
  }, [expireTime]);
  useEffect(() => {
    idInterval = setInterval(() => {
      if (second > 0) setSecond((prev) => prev - 1);
      else {
        if (minute > 0) {
          setMinute((prev) => prev - 1);
          setSecond(59);
        } else {
          if (hour > 0) {
            setHour((prev) => prev - 1);
            setMinute(59);
            setSecond(59);
          } else {
            setExpireTime(!expireTime);
          }
        }
      }
    }, 1000);
    return () => {
      clearInterval(idInterval);
    };
  }, [second, minute, hour, expireTime]);

  return (
    <div className="border w-full flex-auto">
      <div className="flex justify-between items-center p-4 w-full">
        <span className="flex-1 flex justify-center">
          {" "}
          <AiFillStar color="#DD1111" />
        </span>
        <span className="flex-8 font-semibold text-[20px] flex justify-center text-gray-700">
          DEAL DAILY
        </span>
        <span className="flex-1"></span>
      </div>
      <div className="w-full flex flex-col items-center pt-8 px-4 gap-2">
        <img
          src={
            dealdaily?.thumb ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPnriyZ1TkBrE_AFgrp231IQJ3O0tC0k-IzQ&usqp=CAU"
          }
          alt=""
          className="w-full object-contain"
        />
        <span className="line-clamp-1 text-center">{dealdaily?.title}</span>
        <span className="flex h-4">
          {renderStarFromNumber(dealdaily?.totalRating, 20)?.map(
            (el, index) => (
              <span key={index}>{el}</span>
            )
          )}
        </span>
        <span>{`${formatMoney(dealdaily?.price)} VNĐ`}</span>
      </div>
      <div className="px-4 mt-8">
        <div className="flex justify-center gap-2 items-center mb-4">
          <CountDown unit={"Hours"} number={hour} />
          <CountDown unit={"Minutes"} number={minute} />
          <CountDown unit={"Seconds"} number={second} />
        </div>
        <button
          type="button"
          className="flex gap-2 items-center justify-center w-full bg-main hover:bg-gray-800  text-white font-medium py-2"
        >
          <IoMdMenu />
          <span>Options</span>
        </button>
      </div>
    </div>
  );
};

export default memo(DealDaily);
