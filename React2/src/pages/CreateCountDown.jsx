import Timer from "../components/Timer";
import { useOutletContext } from "react-router-dom";

const CreateCountDown = () => {
  const { isPanelOpen, readOnly } = useOutletContext();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Timer isPanelOpen={isPanelOpen} readOnly={readOnly} />
    </div>
  );
};
export default CreateCountDown;