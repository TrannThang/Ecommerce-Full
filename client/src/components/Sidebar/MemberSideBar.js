import React, { memo, Fragment, useState } from "react";
import logo from "assets/logo.png";
import { adminSideBar, memberSideBar } from "utils/contants";
import { NavLink, Link } from "react-router-dom";
import clsx from "clsx";
import { AiOutlineDown, AiOutlineCaretRight } from "react-icons/ai";
import { useSelector } from "react-redux";
import avatar from "assets/avatar.png";

const activeStyle = "px-4 py-2 flex items-center gap-2 bg-blue-500 ";
const notActivedStyle = "px-4 py-2 flex items-center gap-2  hover:bg-blue-100";

const MemberSideBar = () => {
  const [actived, setActived] = useState([]);
  const { current } = useSelector((state) => state.user);
  const handleShowTabs = (tabID) => {
    if (actived.some((el) => el === tabID))
      setActived((prev) => prev.filter((el) => el !== tabID));
    else setActived((prev) => [...prev, tabID]);
  };
  return (
    <div className=" bg-white h-full py-4 w-[250px] flex-none ">
      <div className="w-full flex flex-col items-center justify-center py-4">
        <img
          src={current?.avatar || avatar}
          alt="logo"
          className="w-16 h-16 object-cover"
        />
        <small>{`${current?.lastName} ${current?.firstName}`}</small>
      </div>
      <div>
        {memberSideBar.map((el) => (
          <Fragment key={el.id}>
            {el.type === "SINGLE" && (
              <NavLink
                to={el.path}
                className={({ isActive }) =>
                  clsx(isActive && activeStyle, !isActive && notActivedStyle)
                }
              >
                <span>{el.icon}</span>
                <span>{el.text}</span>
              </NavLink>
            )}
            {el.type === "PARENT" && (
              <div
                onClick={() => handleShowTabs(+el.id)}
                className=" flex flex-col"
              >
                <div className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-blue-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{el.icon}</span>
                    <span>{el.text}</span>
                  </div>
                  {actived.some((id) => id === el.id) ? (
                    <AiOutlineCaretRight />
                  ) : (
                    <AiOutlineDown />
                  )}
                </div>
                {actived.some((id) => +id === +el.id) && (
                  <div className="flex flex-col ">
                    {el.submenu.map((item) => (
                      <NavLink
                        onClick={(e) => e.stopPropagation()}
                        className={({ isActive }) =>
                          clsx(
                            isActive && activeStyle,
                            !isActive && notActivedStyle,
                            "pl-10"
                          )
                        }
                        key={item.text}
                        to={item.path}
                      >
                        {item.text}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default memo(MemberSideBar);
