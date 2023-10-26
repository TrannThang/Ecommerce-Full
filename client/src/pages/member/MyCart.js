import withBaseComponent from "hocs/withBaseComponent";
import React from "react";

const MyCart = (props) => {
  return <div onClick={() => props.navigate("/")}>MyCart</div>;
};

export default withBaseComponent(MyCart);
