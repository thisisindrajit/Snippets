import { EventSchemas, Inngest, InngestMiddleware } from "inngest";
import { TEvents } from "@/types/TEvents";
import { APP_NAME } from "@/constants/common";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: APP_NAME,
  schemas: new EventSchemas().fromRecord<TEvents>(),
});
