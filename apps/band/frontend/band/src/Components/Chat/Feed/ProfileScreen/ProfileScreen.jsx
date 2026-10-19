import { useEffect, useState } from "react";
import "./ProfileScreen.css";
import useFetch from "../../../../hooks/useFetch";

function getSafeImageUrl(url, fallback) {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:text/html") ||
    trimmed.includes('"') ||
    trimmed.includes("'") ||
    trimmed.includes(")") ||
    trimmed.includes("(")
  ) {
    return fallback;
  }
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("data:image/") ||
    lower.startsWith("img/") ||
    lower.startsWith("/apps/") ||
    lower.startsWith("./") ||
    lower.startsWith("/")
  ) {
    return trimmed;
  }
  return fallback;
}

export default function ProfileScreen({ profileId }) {
  const [profileInfos, setProfileInfos] = useState();

  const [profileRequest, profileRequestData] = useFetch();
  useEffect(() => {
    if (profileId) {
      profileRequest({
        url: "api/get-profile",
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: profileId,
      });
    }
  }, [profileId]);

  useEffect(() => {
    if (profileRequestData) {
      if (profileRequestData.status) setProfileInfos(profileRequestData.data);
      else {
        setProfileInfos(false);
      }
      console.log(profileRequestData.msg);
    }
  }, [profileRequestData]);

  const safeBannerUrl = getSafeImageUrl(
    profileInfos?.bannerURL,
    "img/no-profile-banner.png"
  );
  const safeProfilePhotoUrl = getSafeImageUrl(
    profileInfos?.user?.profilePhotoURL,
    "img/no-profile-photo.png"
  );
  const userNick = profileInfos?.user?.nick || "Kullanıcı";

  return (
    <div id="profileScreen-container">
      <div id="profileScreen">
        <div id="profileScreen-header">
          <div
            id="profileScreen-header-banner"
            style={{
              backgroundImage: `url("${safeBannerUrl}")`,
            }}
          ></div>
          <div id="profileScreen-header-info">
            <div id="profileScreen-header-info-row1">
              <div id="profileScreen-header-info-row1-profilePhoto">
                <img
                  src={safeProfilePhotoUrl}
                  alt={`${userNick} profil fotoğrafı`}
                />
              </div>
              <div id="profileScreen-header-info-row1-nick">
                <span>{profileInfos && profileInfos.user.nick}</span>
              </div>
            </div>
              <div id="profileScreen-header-info-row2">
                <div id="profileScreen-header-info-row2-bio">
                  <span>{profileInfos && profileInfos.bio}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
