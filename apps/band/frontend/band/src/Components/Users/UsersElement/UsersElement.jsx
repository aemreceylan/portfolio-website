import { useContext } from "react";
import "./UsersElement.css";
import { WSContext } from "../../../Contexts/WSProvider";

export default function UsersElement({ data }) {
  const {
    setContextMenu,
    setProfileScreen,
    setSelectedChannel,
    setHubSettings,
    userList,
    userId,
  } = useContext(WSContext);
  return (
    <>
      <div
        className="usersElement"
        onContextMenu={(e) => {
          const itemList = [
            {
              text: "Profile Git",
              function: () => {
                setProfileScreen(data.profile);
                setSelectedChannel({ id: "", name: "" });
              },
            },
          ];
          if (userList?.get(userId)?.roles?.includes("1"))
            itemList.push(
              ...[
                {
                  text: "Kullanıcıyı Yetkili Yap",
                  function: () => {
                    setHubSettings("admin-client", data._id);
                  },
                },
                {
                  text: "Kullanıcının Yetkisini Al",
                  function: () => {
                    setHubSettings("no-admin-client", data._id);
                  },
                },
                {
                  text: "Kullanıcıyı Yasakla",
                  function: () => {
                    setHubSettings("ban-client", data._id);
                  },
                },
              ]
            );
          setContextMenu({
            isVisible: true,
            coords: { x: e.pageX, y: e.pageY },
            items: itemList,
          });
        }}
      >
        <div className="usersElement-img">
          <img
            src={
              data.profilePhotoURL &&
              !data.profilePhotoURL.toLowerCase().startsWith("javascript:")
                ? data.profilePhotoURL
                : "img/no-profile-photo.png"
            }
            alt={`${data?.nick || "Kullanıcı"} profil fotoğrafı`}
          />
        </div>
        <div className="usersElement-content">
          <div className="usersElement-nick">
            <span>{data.nick}</span>
          </div>
        </div>
      </div>
    </>
  );
}
