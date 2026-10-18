import Channel from "./Channel/Channel";
import "./Category.css";
import { useState, useEffect } from "react";
import { getInstanceId } from "../../../services/simulatedBackend";

export default function Category({ data }) {
  const catKey = `categoryIsOpen_${getInstanceId()}`;
  const [isOpen, setIsOpen] = useState(() => {
    const raw =
      localStorage.getItem(catKey) ||
      (getInstanceId() === "default" || getInstanceId() === "band"
        ? localStorage.getItem("categoryIsOpen")
        : null);
    if (raw) {
      try {
        const categoryIsOpen = JSON.parse(raw);
        if (categoryIsOpen[data.name] !== undefined) return categoryIsOpen[data.name];
        categoryIsOpen[data.name] = false;
        localStorage.setItem(catKey, JSON.stringify(categoryIsOpen));
        return false;
      } catch {
        return false;
      }
    }
    return false;
  });
  useEffect(() => {
    try {
      const prevData = JSON.parse(
        localStorage.getItem(catKey) ||
          (getInstanceId() === "default" || getInstanceId() === "band"
            ? localStorage.getItem("categoryIsOpen") || "{}"
            : "{}")
      );
      const updated = {
        ...prevData,
        [data.name]: isOpen,
      };
      localStorage.setItem(catKey, JSON.stringify(updated));
      if (getInstanceId() === "default" || getInstanceId() === "band") {
        localStorage.setItem("categoryIsOpen", JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }, [isOpen, catKey, data.name]);
  return (
    <>
      <div className="hub-category">
        <div
          className="hub-category-header"
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
        >
          <span>
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
                />
              </svg>
            )}
            {" " + data.name}
          </span>
        </div>
        <div
          className={
            isOpen
              ? "hub-category-channelList-open"
              : "hub-category-channelList-close"
          }
        >
          {data.channels?.map((element, index) => {
            return <Channel key={index} data={element} />;
          })}
        </div>
      </div>
    </>
  );
}
