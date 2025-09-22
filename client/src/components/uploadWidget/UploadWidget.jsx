import { createContext, useEffect, useRef, useState } from "react";

// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext();

function UploadWidget({ uwConfig, setPublicId, setState, label = "Upload" }) {
  const [loaded, setLoaded] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById("uw");
      if (!uwScript) {
        // If not loaded, create and load the script
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("id", "uw");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.addEventListener("load", () => setLoaded(true));
        document.body.appendChild(script);
      } else {
        // If already loaded, update the state
        setLoaded(true);
      }
    }
  }, [loaded]);

  const openWidget = () => {
    if (!loaded || !window.cloudinary) return;
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        uwConfig,
        (error, result) => {
          if (!error && result && result.event === "success") {
            // Append the uploaded image URL to state
            setState((prev) => [...prev, result.info.secure_url]);
            if (setPublicId) setPublicId(result.info.public_id);
          }
        }
      );
    }
    widgetRef.current.open();
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      <button
        type="button"
        className="cloudinary-button"
        onClick={openWidget}
        disabled={!loaded}
        aria-busy={!loaded}
        title={loaded ? label : "Chargement du module d'upload..."}
      >
        {loaded ? label : "Chargement..."}
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

export default UploadWidget;
export { CloudinaryScriptContext };
