"use client";
import { useOthers, useSelf } from "@liveblocks/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Avatars() {
  const others = useOthers();
  const self = useSelf();
  const all = [self, ...others];

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border">
      <p className="font-semibold text-sm text-gray-700">
        Current Live Users
      </p>
      <div className="flex items-center gap-2 ml-3">
        {all.map((other, i) => (
          <TooltipProvider key={`${other?.id ?? ""}-${i}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group">
                  <Avatar className="w-9 h-9 ring-2 ring-gray-200 group-hover:ring-blue-400 transition duration-150">
                    <AvatarImage
                      src={other?.info.avatar}
                      alt={other?.info.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs font-medium bg-gray-200 text-gray-600">
                      {other?.info.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-sm text-gray-800 bg-white shadow-md border">
                <p>{self?.id === other?.id ? "You" : other?.info.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}

export default Avatars;
