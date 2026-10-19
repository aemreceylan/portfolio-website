import "./MessageFile.css";

function isSafeFileUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:text/html")
  ) {
    return false;
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("img/") ||
    trimmed.startsWith("/apps/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/")
  );
}

export default function MessageFile({ file }) {
  const rawUrl = Array.isArray(file) ? file[1] : "";
  const isSafe = isSafeFileUrl(rawUrl);
  const safeHref = isSafe ? rawUrl : "#";
  const fileName = Array.isArray(file) && file[0] ? file[0] : "Dosya";
  const fileSizeMb =
    Array.isArray(file) && typeof file[2] === "number"
      ? (file[2] / (1024 * 1024)).toFixed(2)
      : "0.00";

  return (
    <div className="messageFile-container">
      <div className="messageFile-container-img" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z" />
        </svg>
      </div>
      <div className="messageFile-container-main">
        {isSafe ? (
          <a href={safeHref} target="_blank" rel="noopener noreferrer">
            {fileName} - {fileSizeMb} MB
          </a>
        ) : (
          <span className="messageFile-unsafe" title="Güvenlik nedeniyle bağlantı engellendi">
            {fileName} (Güvenli Olmayan Bağlantı)
          </span>
        )}
      </div>
    </div>
  );
}
