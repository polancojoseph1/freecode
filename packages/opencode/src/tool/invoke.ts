import { Tool } from "./tool"
import { Plugin } from "../plugin"
import { PartID } from "../session/schema"

export namespace ToolInvoke {
  export async function execute(
    toolID: string,
    args: any,
    ctx: Tool.Context,
    executeFn: (args: any, ctx: Tool.Context) => Promise<any>
  ) {
    await Plugin.trigger(
      "tool.execute.before",
      {
        tool: toolID,
        sessionID: ctx.sessionID,
        callID: ctx.callID,
      },
      { args }
    )

    let result
    try {
      result = await executeFn(args, ctx)
    } catch (error) {
      await Plugin.trigger(
        "tool.execute.after",
        {
          tool: toolID,
          sessionID: ctx.sessionID,
          callID: ctx.callID,
          args,
        },
        undefined
      )
      throw error
    }

    const output = {
      ...result,
      attachments: result.attachments?.map((attachment: any) => ({
        ...attachment,
        id: PartID.ascending(),
        sessionID: ctx.sessionID,
        messageID: ctx.messageID,
      })),
    }

    await Plugin.trigger(
      "tool.execute.after",
      {
        tool: toolID,
        sessionID: ctx.sessionID,
        callID: ctx.callID,
        args,
      },
      output
    )

    return output
  }
}
