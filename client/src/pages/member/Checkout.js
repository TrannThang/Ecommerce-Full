import React, { useEffect } from "react";
import payment from "assets/payment.svg";
import { useSelector } from "react-redux";
import { formatMoney } from "utils/helpers";
import { InputForm, Paypal } from "components";
import { useForm } from "react-hook-form";

const Checkout = () => {
  const { currentCart, current } = useSelector((state) => state.user);
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm();
  const address = watch("address");
  useEffect(() => {
    setValue("address", current?.address);
  }, [current]);

  return (
    <div className="  p-8 w-full grid grid-cols-10 h-full max-h-screen overflow-y-auto gap-6">
      <div className="w-full flex justify-center col-span-4">
        <img src={payment} alt="payment" className="h-[70%] object-contain" />
      </div>
      <div className="flex w-full flex-col justify-center items-center gap-6 col-span-6">
        <h2 className="text-3xl font-bold mb-6">Checkout your order</h2>
        <div className="flex w-full gap-6  ">
          <table className="table-auto flex-1 ">
            <thead>
              <tr className="border bg-gray-200  ">
                <th className=" text-left p-2">Products</th>
                <th className="text-center p-2">Quantity</th>
                <th className="text-right p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {currentCart?.map((el) => (
                <tr className="border" key={el._id}>
                  <td className="text-left p-2">{el.title}</td>
                  <td className="text-center p-2">{el.quantity}</td>
                  <td className="text-right p-2">
                    {formatMoney(el.price) + "VNĐ"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex-1 flex flex-col justify-between gap-[45px]">
            <div className="flex flex-col gap-6">
              <span className="flex items-center gap-8 text-sm">
                <span className="font-medium">Subtotal:</span>
                <span className="text-main font-bold">{`${formatMoney(
                  currentCart?.reduce(
                    (sum, el) => +el?.price * +el?.quantity + sum,
                    0
                  )
                )} VNĐ`}</span>
              </span>
              <InputForm
                label="Your address"
                register={register}
                errors={errors}
                id="address"
                validate={{
                  required: "Need fill this field",
                }}
                fullWidth
                placeholder="Please fill the address first"
                style="text-sm"
              />
            </div>
            {address && address?.length > 10 && (
              <div className="w-full mx-auto">
                <Paypal
                  payload={{
                    products: currentCart,
                    total: Math.round(
                      currentCart?.reduce(
                        (sum, el) => +el?.price * +el?.quantity + sum,
                        0
                      ) / 23500
                    ),

                    address,
                  }}
                  amount={Math.round(
                    currentCart?.reduce(
                      (sum, el) => +el?.price * +el?.quantity + sum,
                      0
                    ) / 23500
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
