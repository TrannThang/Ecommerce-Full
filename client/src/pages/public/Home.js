import React from "react";
import {
  Sidebar,
  Banner,
  BestSeller,
  DealDaily,
  FeatureProduct,
  CustomSlider,
} from "../../components";
import icons from "../../utils/icons";

import { useSelector } from "react-redux";
import { removeNumber } from "../../utils/helpers";

const { IoIosArrowForward } = icons;
const Home = () => {
  const { newProducts } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.app);
  const { isLoggedIn, current } = useSelector((state) => state.user);

  return (
    <>
      <div className="w-main flex ">
        <div className="flex flex-col gap-5 w-[25%] flex-auto ">
          <Sidebar />
          <DealDaily />
        </div>
        <div className="flex flex-col gap-5 pl-5 w-[75%] flex-auto ">
          <Banner />
          <BestSeller />
        </div>
      </div>
      <div className="my-8">
        <FeatureProduct />
      </div>
      <div className="my-8 w-full">
        <h3 className="text-[20px] font-semibold py-[15px] border-main border-b-2 ">
          NEW ARRIVALS
        </h3>
        <div className=" mt-4 mx-[-10px]  ">
          <CustomSlider products={newProducts} />
        </div>
      </div>
      <div className="my-8 w-full">
        <h3 className="text-[20px] font-semibold py-[15px] border-main border-b-2 ">
          HOT COLLECTIONS
        </h3>
        <div className="flex flex-wrap gap-4 mt-4 ">
          {categories
            ?.filter((el) => el.brand.length > 0)
            .map((el) => (
              <div key={el._id} className="w-[396px] ">
                <div className="flex border p-4 min-h-[190px]">
                  <img
                    src={el?.image}
                    alt=""
                    className=" w-[144px] flex-1 h-[129px] object-cover"
                  />
                  <div className="flex-1 text-gray-700">
                    <h4 className="font-semibold uppercase">
                      {removeNumber(el.title)}
                    </h4>

                    <ul className="text-sm">
                      {el?.brand?.map((item) => (
                        <span
                          key={item}
                          className="flex gap-1 items-center text-gray-500"
                        >
                          <IoIosArrowForward size={14} />
                          <li>{removeNumber(item)}</li>
                        </span>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="my-8 w-full">
        <h3 className="text-[20px] font-semibold py-[15px] border-main border-b-2 ">
          BLOG POSTS
        </h3>
      </div>
    </>
  );
};

export default Home;