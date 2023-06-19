import React, { useState, useEffect } from "react";

const useDebounce = (value, ms) => {
  const [debounceValue, setDebounceValue] = useState("");
  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      setDebounceValue(value);
    }, ms);
    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [value, ms]);
  return debounceValue;
};

export default useDebounce;

// muốn khi mà nhập thay đổi giá sẽ gọi API
// Vấn đê onChange sẽ thay đổi liên tục theo mỗi lượt gõ.
//resolve:chỉ call api khi ng dùng nhập xong.
// thời gian onChange
//  tách value onChange price thành 2 biến
// 1.biến de phục vụ UI,gõ tới đâu lưu tới đó.=> UI render
//2. biến dùng để quyết dịnh call API trong setTimeout thì nó sẽ bị delay
