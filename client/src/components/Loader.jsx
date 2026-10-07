import { Loader2 } from "lucide-react";

export default function Loader({
  text = "Loading..."
}) {
  return (
    <div className="closetiq-loader">
      <Loader2
        className="closetiq-loader-icon"
        size={28}
      />

      <p>{text}</p>
    </div>
  );
}