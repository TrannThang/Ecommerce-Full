import React, { useEffect, useState } from "react";
import { ProductCard } from "./";
import { apiGetProducts } from "../apis/product";

const FeatureProduct = () => {
  const [products, setProducts] = useState(null);
  const fetchProducts = async () => {
    const response = await apiGetProducts({
      limit: 9,
      // page: Math.round(Math.random() * 6),
      totalRating: 4,
    });
    if (response.success) {
      setProducts(response.products);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <div className="w-full">
      <h3 className="text-[20px] font-semibold py-[15px] border-main border-b-2 ">
        FEATURED PRODUCT
      </h3>
      <div className="flex flex-wrap mt-[15px] mx-[-10px] ">
        {products?.map((el) => (
          <ProductCard
            key={el._id}
            image={el.thumb}
            title={el.title}
            totalRating={el.totalRating}
            price={el.price}
          />
        ))}
      </div>
      <div className="flex justify-between ">
        <img
          src="https://cdn.shopify.com/s/files/1/1903/4853/files/banner1-bottom-home2_b96bc752-67d4-45a5-ac32-49dc691b1958_600x.jpg?v=1613166661"
          alt=""
          className="w-[49%]  object-contain"
        />
        <div className="flex-col flex justify-between gap-4 w-[24%] ">
          <img
            src="https://cdn.shopify.com/s/files/1/1903/4853/files/banner2-bottom-home2_400x.jpg?v=1613166661"
            alt=""
          />
          <img
            src="https://cdn.shopify.com/s/files/1/1903/4853/files/banner3-bottom-home2_400x.jpg?v=1613166661"
            alt=""
          />
        </div>
        <img
          className="w-[24%] object-contain"
          src="https://cdn.shopify.com/s/files/1/1903/4853/files/banner4-bottom-home2_92e12df0-500c-4897-882a-7d061bb417fd_400x.jpg?v=1613166661"
          alt=""
        />
      </div>
    </div>
  );
};

export default FeatureProduct;
