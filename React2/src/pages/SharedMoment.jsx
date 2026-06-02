import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTimer } from "../context/TimerContext";
import Timer from "../components/Timer";

const SharedMoment = () => {
    const { slug } = useParams();
    const [momentData, setmomentData] = useState(null);
    const { loadConfig } = useTimer();

    console.log("Slug from URL:", slug); // Debugging line to check the slug value
    // Use the slug to fetch the shared moment's configuration from the backend and display it
    useEffect(() => {
        const fetchSharedMoment = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/moments/shared/${slug}`);
                setmomentData(response.data.data);
                loadConfig(response.data.data); // Inject the database config into the context!
            } catch (error) {
                console.error("Error fetching shared moment:", error);
            }
        };

        fetchSharedMoment();
    }, [slug]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 md:px-8">
        {momentData ? (
            <Timer isPanelOpen={false} />
        ) : (
            <div className="text-orange-50/50 uppercase tracking-widest text-sm animate-pulse">Loading moment...</div>
        )}
    </div>
  )
}

export default SharedMoment