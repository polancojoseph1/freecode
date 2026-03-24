import { Hono } from "hono"
import { describeRoute, validator, resolver } from "hono-openapi"
import z from "zod"
import { PermissionNext } from "@/permission/next"
import { PermissionID } from "@/permission/schema"
import { errors } from "../error"
import { lazy } from "../../util/lazy"

export const PermissionRoutes = lazy(() =>
  new Hono()
    .post(
      "/:requestID/reply",
      describeRoute({
        summary: "Respond to permission request",
        description: "Approve or deny a permission request from the AI assistant.",
        operationId: "permission.reply",
        responses: {
          200: {
            description: "Permission processed successfully",
            content: {
              "application/json": {
                schema: resolver(z.boolean()),
              },
            },
          },
          ...errors(400, 404),
        },
      }),
      validator(
        "param",
        z.object({
          requestID: PermissionID.zod,
        }),
      ),
      validator("json", z.object({ reply: PermissionNext.Reply, message: z.string().optional() })),
      async (c) => {
        const params = c.req.valid("param")
        const json = c.req.valid("json")
        await PermissionNext.reply({
          requestID: params.requestID,
          reply: json.reply,
          message: json.message,
        })
        return c.json(true)
      },
    )
    .get(
      "/",
      describeRoute({
        summary: "List pending permissions",
        description: "Get all pending permission requests across all sessions.",
        operationId: "permission.list",
        responses: {
          200: {
            description: "List of pending permissions",
            content: {
              "application/json": {
                schema: resolver(PermissionNext.Request.array()),
              },
            },
          },
        },
      }),
      async (c) => {
        const permissions = await PermissionNext.list()
        return c.json(permissions)
      },
    )
    .get(
      "/ruleset",
      describeRoute({
        summary: "List ruleset",
        description: "Get the current permission ruleset.",
        operationId: "permission.listRuleset",
        responses: {
          200: {
            description: "List of rules",
            content: {
              "application/json": {
                schema: resolver(PermissionNext.Ruleset),
              },
            },
          },
        },
      }),
      async (c) => {
        const ruleset = await PermissionNext.listRuleset()
        return c.json(ruleset)
      },
    )
    .delete(
      "/ruleset",
      describeRoute({
        summary: "Delete rule",
        description: "Delete a specific rule from the permission ruleset.",
        operationId: "permission.deleteRule",
        responses: {
          200: {
            description: "Rule deleted successfully",
            content: {
              "application/json": {
                schema: resolver(z.boolean()),
              },
            },
          },
        },
      }),
      validator("json", PermissionNext.Rule),
      async (c) => {
        const json = c.req.valid("json")
        await PermissionNext.deleteRule(json)
        return c.json(true)
      },
    ),
)
