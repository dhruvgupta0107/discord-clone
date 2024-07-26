"use client";

import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import axios from 'axios';
import qs from "query-string";

import {
 Dialog,
 DialogContent,
 DialogFooter,
 DialogHeader,
 DialogTitle 
} from '@/components/ui/dialog';
import { 
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
const formSchema = z.object({
        name: z.string().min(1, {
            message: "Channel name is required"
        }).refine(name => name !== "general",{
            message: "Channel name cannot be 'general'"
        }),
        type: z.nativeEnum(ChannelType)
    })
export const CreateChannelModal = ()=>{
    const {isOpen, onClose, data, type} = useModal();
    const router = useRouter();
    const params = useParams();

    const isModalOpen= isOpen && type === "createChannel";

    const {channelType} = data;

    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            name: "",
            type: channelType || ChannelType.TEXT,
        }
    });
    useEffect(()=>{
        if(channelType){
            form.setValue("type", channelType);
        }
        else{
            form.setValue('type', ChannelType.TEXT)
        }
        },[form, channelType])
    
    const isLoading = form.formState.isSubmitting;

    const onSuubmit = async(values: z.infer<typeof formSchema>)=>{
       try {
        const url = qs.stringifyUrl({
            url: '/api/channels',
            query: {
                serverId : params?.serverId
            }
        })
        await axios.post(url, values);
        form.reset();
        router.refresh();
        onClose();
       } catch (error) {
        console.log(error)
       }
    }

    const handleClose=()=>{
        form.reset();
        onClose();
    }
    
    return(
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-white text-black p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold'>
                        Create channel

                    </DialogTitle>

                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSuubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <FormField 
                            control={form.control}
                            name="name"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                       Chennel Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input 
                                         disabled={isLoading}
                                         className="bg-zinc-300/50 border-0 
                                         focus-visible:ring-0 text-black 
                                         focus-visible:ring-offset-0 " 
                                         placeholder="Enter channel name"
                                         {...field} 
                                          />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                             />
                             <FormField
                             control={form.control}
                             name="type"
                             render={({field})=>(
                                <FormItem>
                                    <FormLabel>Channel type</FormLabel>
                                    <Select disabled={isLoading}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className=" bg-zinc-300/50 border-0 focus-visible:ring-0
                                            text-black focus-visible:ring-offset-0" 
                                            >
                                                <SelectValue
                                                 placeholder="select channel type"
                                                 />

                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(ChannelType).map((type)=>(
                                                <SelectItem
                                                 key={type}
                                                 value={type}
                                                 className="capitalize">
                                                    {type.toLowerCase()}

                                                </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                    <FormMessage />

                                </FormItem>
                             )}>

                             </FormField>

                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button disabled={isLoading} variant="primary">
                                Create
                            </Button>

                        </DialogFooter>

                    </form>

                </Form>
                 
            </DialogContent>
        </Dialog>
    )
}