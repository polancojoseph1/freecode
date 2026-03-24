import { Plugin } from "../plugin"
import { PartID } from "../session/schema"
import type { Tool } from "./tool"
import type { MessageV2 } from "../session/message-v2"

import { SessionID, MessageID } from "../session/schema"

export namespace ToolInvoke {
  export async function invoke<
    T extends {
      attachments?: Omit<MessageV2.FilePart, "id" | "sessionID" | "messageID">[]
      [key: string]: any
    },
  >(input: {
    tool: string;
    args: any;
    ctx: Tool.Context;
    sessionID: SessionID;
    messageID: MessageID;
    execute: () => Promise<T>
  }): Promise<
    T & { attachments?: MessageV2.FilePart[] }
  > {
    await Plugin.trigger(
      "tool.execute.before",
      {
        tool: input.tool,
        sessionID: input.sessionID,
        callID: input.ctx.callID!,
      },
      { args: input.args },
    )

    const result = await input.execute()

    const output = {
      ...result,
    } as T & { attachments?: MessageV2.FilePart[] }

    if (result && result.attachments) {
      output.attachments = result.attachments.map((attachment) => ({
        ...attachment,
        id: PartID.ascending(),
        sessionID: input.sessionID,
        messageID: input.messageID,
      }))
    }

    await Plugin.trigger(
      "tool.execute.after",
      {
        tool: input.tool,
        sessionID: input.sessionID,
        callID: input.ctx.callID!,
        args: input.args,
      },
      output,
    )

    return output
  }
}
