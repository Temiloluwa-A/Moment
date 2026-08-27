import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTimer } from "../context/TimerContext";
import Timer from "../components/Timer";
import api from "../api/client";

const SharedMoment = () => {
    const { slug } = useParams();
    const [momentData, setMomentData] = useState(null);
    const { loadConfig } = useTimer();

    // Use the slug to fetch the shared moment's configuration from the backend and display it
    useEffect(() => {
        const fetchSharedMoment = async () => {
            try {
                const response = await api.get(`/moments/shared/${slug}`);
                setMomentData(response.data.data);
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
            <Timer isPanelOpen={false} readOnly />
        ) : (
            <div className="text-text/50 uppercase tracking-widest text-sm animate-pulse">Loading moment...</div>
        )}
    </div>
  )
}

export default SharedMoment