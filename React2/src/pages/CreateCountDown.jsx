import Timer from "../components/Timer";
import { useOutletContext } from "react-router-dom";

const CreateCountDown = () => {
  const { isPanelOpen, isCompleted } = useOutletContext();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Timer isPanelOpen={isPanelOpen} readOnly={isCompleted} />
    </div>
  );
};
export default CreateCountDown;