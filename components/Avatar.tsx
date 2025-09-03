import Image  from "next/image";
import {FaUserCircle} from "react-icons/fa"

const Avatar = ({ src }: { src?: string }) => {
  if (src != null) {
    return (
        <Image
          src={src}
          alt="avatar"
          className="rounded-full"
          width={24}
          height={24}
        />
      
    );
  }
};

export default Avatar;
