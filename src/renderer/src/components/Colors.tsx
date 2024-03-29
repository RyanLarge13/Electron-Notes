import colors from "@renderer/constants/colors";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";

const Colors = ({ setColor }: { setColor: Dispatch<SetStateAction<string>> }): JSX.Element => {
  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {colors.map((color) => (
        <motion.button
          whileHover={{ scale: 1.1 }}
          key={color.color}
          className={`${color.color} w-5 h-5 rounded-full shadow-md`}
          onClick={(e) => {
            e.stopPropagation();
            setColor(color.color);
          }}
        ></motion.button>
      ))}
    </div>
  );
};

export default Colors;
