import Timer from "../components/Timer";
import { useOutletContext } from "react-router-dom";

const CreateCountUP = () => {
  const { isPanelOpen, readOnly } = useOutletContext();
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Timer isPanelOpen={isPanelOpen} readOnly={readOnly} />
    </div>
  );
};
export default CreateCountUP;