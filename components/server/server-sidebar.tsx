import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSearch } from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";

interface ServerSidebarProps {
  serverId: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 w-4 h-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 w-4 h-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 w-4 h-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="mr-2 w-4 h-4 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 w-4 h-4 text-rose-500" />
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

 if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where:{
        id:serverId,
    },
    include:{
        channels:{
            orderBy:{
                createdAt: 'asc'
            },
        },
        members:{
            include:{
                profile:true
            },
            orderBy:{
                role:'asc'
            }
        }

    }
  })
  const textChannels= server?.channels.filter((channel)=>channel.type === ChannelType.TEXT)
  const audioChannels = server?.channels.filter((channel)=>channel.type === ChannelType.AUDIO)
  const videoChannel = server?.channels.filter((channel)=>channel.type === ChannelType.VIDEO)
  const  members = server?.members.filter((member)=>member.profileId !== profile.id)
  
  if(!server){
    return redirect("/");
  }
  const role = server.members.find((member)=> member.profileId === profile.id)?.role;
  return (
  <div className="flex flex-col h-full w-full text-primary dark:bg-[#2b2d31] bg-[#f2f3f5]">
    <ServerHeader 
     server={server}
     role={role}
    />

    <ScrollArea className="flex-1 px-3">
      <div className="mt-2">
        <ServerSearch 
         data={[
          {
            label : 'Text Channels',
            type: 'channel',
            data:textChannels?.map((channel)=>({
              id: channel.id,
              name: channel.name,
              icon: iconMap[channel.type],
            }))
          },
          {
            label : 'Voice Channels',
            type: 'channel',
            data:audioChannels?.map((channel)=>({
              id: channel.id,
              name: channel.name,
              icon: iconMap[channel.type],
            }))
          },
          {
            label : 'Video Channels',
            type: 'channel',
            data:videoChannel?.map((channel)=>({
              id: channel.id,
              name: channel.name,
              icon: iconMap[channel.type],
            }))
          },
          {
            label : 'Members Channels',
            type: 'member',
            data:members?.map((member)=>({
              id: member.id,
              name: member.profile.name,
              icon: roleIconMap[member.role],
            }))
          }
         ]

         }
        />

      </div>
      <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
      {!!textChannels?.length &&(
        <div className="mb-2">
          <ServerSection
           label="Text Channel"
           sectionType = "channels"
           channelType = {ChannelType.TEXT}
           role={role}
            />
            {textChannels.map((channel)=>(
              <ServerChannel channel={channel}
               key={channel.id}
               role={role}
               server={server} />
            ))}
        </div>
      )}
      {!!audioChannels?.length &&(
        <div className="mb-2">
          <ServerSection
           label="Audio Channel"
           sectionType = "channels"
           channelType = {ChannelType.AUDIO}
           role={role}
            />
            {audioChannels.map((channel)=>(
              <ServerChannel channel={channel}
               key={channel.id}
               role={role}
               server={server} />
            ))}
        </div>
      )}
      {!!videoChannel?.length &&(
        <div className="mb-2">
          <ServerSection
           label="Video Channel"
           sectionType = "channels"
           channelType = {ChannelType.VIDEO}
           role={role}
            />
            {videoChannel.map((channel)=>(
              <ServerChannel channel={channel}
               key={channel.id}
               role={role}
               server={server} />
            ))}
        </div>
      )}
      {!!members?.length &&(
        <div className="mb-2">
          <ServerSection
           label="Members"
           sectionType = "members"
           role={role}
           server={server}
            />
            {members.map((member)=>(
              <ServerMember key={member.id}
               member={member}
               server={server} />
            ))}
        </div>
      )}

    </ScrollArea>

  </div>
  )
};
