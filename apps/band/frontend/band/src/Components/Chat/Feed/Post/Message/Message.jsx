import "./Message.css";
import MessageFile from "./MessageFile/MessageFile";

export default function Message({ data }) {
  function parseLinks(rawText) {
    if (!rawText || typeof rawText !== "string") return null;
    const urlPattern = /(https?:\/\/[^\s]+)/;
    return rawText.split(urlPattern).map((part, index) => {
      if (/^https?:\/\/[^\s]+$/.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return part;
    });
  }

  const textContent = typeof data?.text === "string" ? data.text : "";

  return (
    <div className="message">
      {textContent ? <span>{parseLinks(textContent)}</span> : null}
      {Array.isArray(data?.file) && data.file.length > 0 && (
        <MessageFile file={data.file} />
      )}
    </div>
  );
}
