"use client";

import { FC, useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Bell } from "lucide-react";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

const CNotificationHolder: FC = () => {
    const { userId } = useAuth();
    const userByExternalId = useQuery(api.users.getUserByExternalId, {
        externalId: userId ?? undefined,
    });

    const notifications = useQuery(api.notifications.getNotificationsByUserId, {
        userId: userByExternalId?._id ?? undefined,
    });

    const [notificationBadgeCount, setNotificationBadgeCount] =
        useState<number>(0);
    const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState<Date>(notifications && notifications.length > 0 ? new Date(notifications[0]._creationTime) : new Date());

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const newNotificationTimestamp = new Date(notifications[0]._creationTime);
            if (newNotificationTimestamp > lastNotificationTimestamp) {
                setLastNotificationTimestamp(newNotificationTimestamp);

                // Find all the notifications that are newer than the last notification timestamp
                const newNotifications = notifications.filter(
                    (notification) =>
                        new Date(notification._creationTime) > lastNotificationTimestamp
                );

                // Update the notification badge count
                setNotificationBadgeCount(prevCount => prevCount + newNotifications.length);

                toast.info(`You have ${newNotifications.length === 1
                        ? `${newNotifications.length} new notification`
                        : `${newNotifications.length} new notifications`
                    }!`, {
                    duration: 7500,
                });
            }
        }
    }, [notifications, lastNotificationTimestamp])

    return notifications ? (<Sheet onOpenChange={() => setNotificationBadgeCount(0)}>
        <SheetTrigger asChild>
            {notificationBadgeCount > 0 ? (
                <div className="relative inline-block">
                    <div className="absolute rounded-[50%] h-4 w-4 flex flex-col items-center justify-center bg-secondary text-secondary-foreground text-[10px] p-2.5 right-[-10px] top-[-10px]">
                        {notificationBadgeCount > 9 ? "9+" : notificationBadgeCount}
                    </div>
                    <Bell className="h-7 w-7 cursor-pointer rounded-lg bg-background p-1.5 text-secondary border border-secondary" />
                </div>
            ) : (
                <Bell className="h-7 w-7 cursor-pointer rounded-lg bg-background p-1.5 text-secondary border border-secondary" />
            )}
        </SheetTrigger>
        <SheetContent
            side="right"
            className="w-[95%] sm:w-[24rem] px-2 sm:px-4 max-h-screen overflow-auto z-[100]"
        >
            <SheetHeader>
                <SheetTitle>Latest notifications</SheetTitle>
                {notifications.length > 0 && <div className="text-xs font-medium text-primary">
                    Latest notification received - {" "}
                    {convertToPrettyDateFormatInLocalTimezone(
                        new Date(notifications[0]._creationTime)
                    )}
                </div>}
                <Separator className="bg-foreground" />
                <SheetDescription asChild>
                    <div className="flex flex-col gap-2">
                        {notifications.length === 0 ? (
                            <div className="text-center w-full my-2">No notifications!</div>
                        ) : (
                            notifications.map((notification) => {
                                const searchQuery = notification.notification.split("|")[0];

                                if (
                                    notification.notification_type_name ===
                                    "no information"
                                ) {
                                    return (
                                        <div
                                            key={notification._id}
                                            className="bg-orange-300/10 border border-orange-500 text-orange-500 p-3 rounded-md flex flex-col gap-4 leading-loose text-justify"
                                        >
                                            <span>
                                                No information found for search query{" "}
                                                <span className="font-semibold italic">
                                                    {searchQuery}
                                                </span>
                                                . Please try again with a different query.
                                            </span>
                                            <div className="bg-background text-xs font-medium p-2 text-foreground w-fit rounded-md border border-orange-500">
                                                {convertToPrettyDateFormatInLocalTimezone(
                                                    new Date(notification._creationTime)
                                                )}
                                            </div>
                                        </div>
                                    );
                                } else if (
                                    notification.notification_type_name ===
                                    "error"
                                ) {
                                    return (
                                        <div
                                            key={notification._id}
                                            className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md flex flex-col gap-4 leading-loose text-justify"
                                        >
                                            <span>
                                                Some error occurred 😭 while generating snippet for
                                                search query{" "}
                                                <span className="font-semibold italic">
                                                    {searchQuery}
                                                </span>
                                                . Please try again with the same query or a similar
                                                query.
                                            </span>
                                            <div className="bg-background text-xs font-medium p-2 text-foreground w-fit rounded-md border border-destructive">
                                                {convertToPrettyDateFormatInLocalTimezone(
                                                    new Date(notification._creationTime)
                                                )}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const snippetLink = notification.notification.split("|")[1];

                                    return (
                                        <div
                                            key={notification._id}
                                            className="bg-secondary/10 border border-secondary text-secondary p-3 rounded-md flex flex-col gap-4 leading-loose text-justify"
                                        >
                                            <span>
                                                Snippet has been successfully generated 🥳 for search
                                                query{" "}
                                                <span className="font-semibold italic">
                                                    {searchQuery}
                                                </span>
                                                . You can view it by clicking{" "}
                                                <Link
                                                    href={`/${snippetLink}`}
                                                    className="font-semibold underline"
                                                >
                                                    here
                                                </Link>
                                                .
                                            </span>
                                            <div className="bg-background text-xs font-medium p-2 text-foreground w-fit rounded-md border border-secondary">
                                                {convertToPrettyDateFormatInLocalTimezone(
                                                    new Date(notification._creationTime)
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            })
                        )}
                    </div>
                </SheetDescription>
            </SheetHeader>
        </SheetContent>
    </Sheet>) : null

};

export default CNotificationHolder;