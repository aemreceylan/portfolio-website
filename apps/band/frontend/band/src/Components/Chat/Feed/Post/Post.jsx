import Message from "./Message/Message";

import "./Post.css";
import { useContext } from "react";
import { WSContext } from "../../../../Contexts/WSProvider";

export default function Post({ data }) {
  const { userList } = useContext(WSContext);

  const senderPhotoUrl = userList?.get(data.sender._id)?.profilePhotoURL;
  const safePhotoUrl =
    senderPhotoUrl && !senderPhotoUrl.toLowerCase().startsWith("javascript:")
      ? senderPhotoUrl
      : "img/no-profile-photo.png";

  const dateObj = new Date(data?.timestamp);
  const formattedTime = !isNaN(dateObj.getTime())
    ? `${String(dateObj.getHours()).padStart(2, "0")}:${String(
        dateObj.getMinutes()
      ).padStart(2, "0")}`
    : "--:--";

  return (
    <div className="post">
      <div className="post-account">
        <img
          src={safePhotoUrl}
          alt={`${data?.sender?.nick || "Kullanıcı"} avatar`}
        />
      </div>
      <div className="post-content">
        <div className="post-info">
          <span className="post-info-nick">{data?.sender?.nick || "User"}</span>
          <span className="post-info-timestamp">{formattedTime}</span>
        </div>
        <div className="post-message-list">
          <Message data={data} />
        </div>
      </div>
    </div>
  );
}
