import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const [message, setMessage] = useState("");

  const showNotice = useCallback((text) => {
    setMessage(text);
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <NoticeContext.Provider value={showNotice}>
      {message && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#198754",
            color: "white",
            padding: "12px 20px",
            borderRadius: "6px",
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {message}
        </div>
      )}

      {children}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const context = useContext(NoticeContext);

  if (!context) {
    throw new Error("useNotice phải được sử dụng bên trong NoticeProvider");
  }

  return context;
};
