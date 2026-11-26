import { useState, useEffect } from "react";

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = localStorage.getItem(key);

      return savedValue !== null ? JSON.parse(savedValue) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Không thể lưu localStorage", error);
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
