import React, { memo, useState, useCallback } from "react";
import { productInfoTabs } from "../utils/contants";
import VoteBar from "../components/Votebar";
import Button from "../components/Button";
import VoteOptions from "./VoteOptions";
import Comments from "./Comments";
import { renderStarFromNumber } from "../utils/helpers";
import { apiRatings } from "../apis/product";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../store/app/appSlice";
import Swal from "sweetalert2";
import path from "../utils/path";
import { useNavigate } from "react-router-dom";

const ProductInfomation = ({
  totalRating,
  rating,
  nameProduct,
  pid,
  rerender,
}) => {
  const navigate = useNavigate();
  const [activedTab, setActivedTab] = useState(1);
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.user);

  const handleSubmitVoteOption = async ({ comment, score }) => {
    if (!comment || !pid || !score) {
      alert("Please vote when click submit");
      return;
    }
    await apiRatings({ star: score, comment, pid, updatedAt: Date.now() });
    dispatch(
      showModal({
        isShowModal: false,
        modalChildren: null,
      })
    );
    rerender();
  };
  const handleVoteNow = () => {
    if (!isLoggedIn) {
      Swal.fire({
        text: "Login to vote",
        cancelButtonText: "Cancel",
        confirmButtonText: "Go Login",
        title: "Oops!",
        showCancelButton: true,
      }).then((rs) => {
        if (rs.isConfirmed) {
          navigate(`/${path.LOGIN}`);
        }
      });
    } else {
      dispatch(
        showModal({
          isShowModal: true,
          modalChildren: (
            <VoteOptions
              handleSubmitVoteOption={handleSubmitVoteOption}
              nameProduct={nameProduct}
            />
          ),
        })
      );
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 relative bottom-[-1px]">
        {productInfoTabs.map((el) => (
          <span
            className={`p-2  px-4 cursor-pointer ${
              activedTab === +el.id
                ? "bg-white border border-b-0"
                : "bg-gray-200"
            } `}
            key={el.id}
            onClick={() => setActivedTab(el.id)}
          >
            {el.name}
          </span>
        ))}
      </div>
      <div className="w-full  border p-4">
        {productInfoTabs.some((el) => el.id === activedTab) &&
          productInfoTabs.find((el) => el.id === activedTab)?.content}
      </div>

      <div className="flex flex-col py-8 w-main ">
        <div className="flex border">
          <div className="flex-4 border flex-col flex items-center justify-center">
            <span className="font-semibold  text-3xl">{`${totalRating}/5`}</span>
            <span className="flex items-center gap-1">
              {renderStarFromNumber(totalRating)?.map((el, index) => (
                <span key={index}>{el}</span>
              ))}
            </span>
            <span className="text-sm ">{`${rating?.length} reviewers and commentors`}</span>
          </div>
          <div className="flex-6  flex-col gap-2  flex  p-4">
            {Array.from(Array(5).keys())
              .reverse()
              .map((el) => (
                <VoteBar
                  key={el}
                  number={el + 1}
                  ratingTotal={rating?.length}
                  ratingCount={rating?.filter((i) => i.star === el + 1)?.length}
                />
              ))}
          </div>
        </div>
        <div className="p-4 items-center flex text-sm justify-center flex-col gap-2">
          <span>Do you review this product</span>
          <Button handleOnClick={handleVoteNow}>Vote now!</Button>
        </div>
        <div className="flex flex-col gap-4">
          {rating?.map((el) => (
            <Comments
              key={el.id}
              star={el.star}
              updatedAt={el.updatedAt}
              comment={el.comment}
              name={`${el.postedBy?.lastName} ${el.postedBy?.firstName}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(ProductInfomation);
