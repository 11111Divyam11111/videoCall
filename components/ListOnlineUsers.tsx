"use client";
import { useSocket } from "@/context/socketContext";
import { useUser } from "@clerk/nextjs";
import Avatar from "./Avatar";

const ListOnlineUsers = () => {
  const { user } = useUser();
  const { onlineUsers , handleCall} = useSocket();

  return (
    <div className="flex justify-start border-b border-b-primary/10 w-full items-center pb-2">
      {onlineUsers &&
        onlineUsers.map((online) => {
          if (online.profile.id == user?.id) return null;
          else {
            return (
              <div
                key={online.userId}
                onClick={() => handleCall(online)}
                className="flex gap-1 my-2 cursor-pointer items-center"
              >
                <Avatar src={online.profile.imageUrl} />
                <div>{online.profile.fullName?.split(" ")[0]}</div>
              </div>
            );
          }
        })}
    </div>
  );
};

export default ListOnlineUsers;
