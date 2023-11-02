import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputForm from "./InputForm";
import Button from "./Button";
import { getBase64, removeNumber } from "utils/helpers";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { showModal } from "store/app/appSlice";
import Loading from "./Loading";
import { useDispatch } from "react-redux";
import { apiAddVariant } from "apis";

const CustomizeVatiants = ({
  customizeVariants,
  setCustomizeVariants,
  render,
}) => {
  const [preview, setPreview] = useState({
    thumb: "",
    images: [],
  });
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  useEffect(() => {
    reset({
      title: customizeVariants?.title,
      color: customizeVariants?.color,
      price: customizeVariants?.price,
    });
  }, [customizeVariants]);

  const handleAddVariant = async (data) => {
    if (data.color === customizeVariants.color)
      Swal.fire("Opps", "Color not changed", "info");
    else {
      const formData = new FormData();
      for (let i of Object.entries(data)) {
        formData.append(i[0], i[1]);
      }
      if (data.thumb) formData.append("thumb", data.thumb[0]);
      if (data.images) {
        for (let image of data.images) formData.append("images", image);
      }
      dispatch(showModal({ isShowModal: true, modalChilren: <Loading /> }));
      const response = await apiAddVariant(formData, customizeVariants._id);
      dispatch(showModal({ isShowModal: false, modalChilren: null }));
      if (response.success) {
        toast.success(response.mes);
        reset();
        setPreview({ thumb: "", images: [] });
      } else toast.error(response.mes);
    }
  };
  const handlePreviewThumb = async (file) => {
    const base64Thumb = await getBase64(file);
    setPreview((prev) => ({ ...prev, thumb: base64Thumb }));
  };

  const handlePreviewImages = async (files) => {
    const imagesPreview = [];
    for (let file of files) {
      if (file.type !== "image/png" && file.type !== "image/jpeg") {
        toast.warning("File not supported!");
        return;
      }
      const base64 = await getBase64(file);
      imagesPreview.push(base64);
    }

    setPreview((prev) => ({ ...prev, images: imagesPreview }));
  };
  useEffect(() => {
    if (watch("thumb") instanceof FileList && watch("thumb").length > 0) {
      handlePreviewThumb(watch("thumb")[0]);
    }
  }, [watch("thumb")]);

  useEffect(() => {
    if (watch("images") instanceof FileList && watch("images").length > 0)
      handlePreviewImages(watch("images"));
  }, [watch("images")]);

  return (
    <div className="w-full flex flex-col gap-4 relative">
      <div className="h-[69px] w-full"></div>
      <div className="px-4 border-b bg-gray-100  flex justify-between right-0 left-[327px] items-center fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight border-b">
          Customize variant of Products
        </h1>
        <span
          className="text-main hover:underline cursor-pointer"
          onClick={() => setCustomizeVariants(null)}
        >
          Back
        </span>
      </div>
      <form
        onSubmit={handleSubmit(handleAddVariant)}
        className="p-4 w-full flex flex-col gap-4"
      >
        <div className="flex gap-4 items-center w-full">
          <InputForm
            label="Original name"
            register={register}
            errors={errors}
            id="title"
            style="flex-auto "
            validate={{
              required: "Need fill this field",
            }}
            fullWidth
            placeholder="Title of variant"
          />
        </div>
        <div className="flex gap-4 items-center w-full">
          <InputForm
            label="Price variant"
            register={register}
            errors={errors}
            id="price"
            validate={{
              required: "Need fill this field",
            }}
            fullWidth
            placeholder="Price of new variant"
            type="number"
            style="flex-auto"
          />
          <InputForm
            label="Color variant"
            register={register}
            errors={errors}
            id="color"
            validate={{
              required: "Need fill this field",
            }}
            fullWidth
            placeholder="Color of new variant"
            style="flex-auto"
          />
        </div>
        <div className="flex flex-col gap-2 mt-8">
          <label className="font-semibold" htmlFor="thumb">
            Upload thumb
          </label>
          <input
            type="file"
            id="thumb"
            {...register("thumb", { required: "Need fill" })}
          />
          {errors["thumb"] && (
            <small className="text-xs text-red-500">
              {errors["thumb"]?.message}
            </small>
          )}
        </div>
        {preview?.thumb && (
          <div className="my-4 ">
            <img
              src={preview.thumb}
              alt="thumbnail"
              className="w-[200px] object-contain"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 mt-8">
          <label className="font-semibold" htmlFor="products">
            Upload image of product
          </label>
          <input
            type="file"
            id="products"
            multiple
            {...register("images", { required: "Need fill" })}
          />
          {errors["images"] && (
            <small className="text-xs text-red-500">
              {errors["images"]?.message}
            </small>
          )}
        </div>
        {preview?.images.length > 0 && (
          <div className="my-4 flex w-full gap-3 flex-wrap ">
            {preview.images?.map((el, idx) => (
              <div key={idx} className="w-fit relative">
                <img
                  src={el}
                  alt="product"
                  className="w-[200px] object-contain"
                />
              </div>
            ))}
          </div>
        )}
        <div className="my-6">
          <Button type="submit">Add variant product</Button>
        </div>
      </form>
    </div>
  );
};

export default memo(CustomizeVatiants);
