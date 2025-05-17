import { motion} from "framer-motion";
import stringToColor from "@/lib/stringToColor";
function FollowPointer({x,y,info}: {
    x: number;
    y: number;
    info: {
        
        name: string;
        avatar: string;
        email: string;
    }
}) {
const color = stringToColor(info.email || '1')

  return (
    <motion.div className="h-4 w-4 rounded-full absolute z-50"
    style={{
        top: y,
        left: x,
        pointerEvents: "none",
    }}
    initial={{
        scale: 1,
        opacity: 1,
    }}
    animate={{
        scale: 1,
        opacity: 1,
    }}
    exit={{
        scale: 0,
        opacity: 0,
    }}
    >
        <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill={color}
        style={{ display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M3 2L21 12L13 14L15 22L11 20L9 14L3 2Z" />
        </svg>
        <motion.div style = {{backgroundColor: color}}
         initial={{
            scale: 0.5,
            opacity: 0,
         }}
         animate={{
            scale: 1,
            opacity: 1,
         }}
         exit={{
            scale: 0.5,
            opacity: 0,
         }}
         className={
            'px-2 py-2 bg-neutral-200 text-black font-bold whitespace-nowrap min-w-max rounded-full text-xs'
         }
        >
            {info?.name || info.email}
        </motion.div>
        </motion.div>
  )
}

export default FollowPointer