import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTimer } from "../context/TimerContext";
import { useSharedMoment } from "../hooks/useSharedMoment";
import Timer from "../components/Timer";

const SharedMoment = () => {
    const { slug } = useParams();
    const { loadConfig } = useTimer();
    const { data: momentData, isLoading, isError } = useSharedMoment(slug);

    // Inject the fetched moment into the timer context once it arrives.
    useEffect(() => {
        if (momentData) loadConfig(momentData);
    }, [momentData, loadConfig]);

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16 px-4 md:px-8">
                <p className="text-error text-sm uppercase tracking-widest">
                    Could not find this moment. The link may be invalid or the moment is no longer public.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center pt-16 px-4 md:px-8">
            {!isLoading && momentData ? (
                <Timer isPanelOpen={false} readOnly />
            ) : (
                <div className="text-text/50 uppercase tracking-widest text-sm animate-pulse">Loading moment...</div>
            )}
        </div>
    )
}

export default SharedMoment
