import { createMemo, createSignal, onMount, For, Match, Switch } from "solid-js"
import { useSDK } from "@tui/context/sdk"
import { useTheme } from "../context/theme"
import { DialogSelect, type DialogSelectOption, type DialogSelectRef } from "@tui/ui/dialog-select"
import { TextAttributes } from "@opentui/core"
import { useToast } from "../ui/toast"
import type { PermissionRule } from "@opencode-ai/sdk/v2"

export function DialogPermissionList() {
  const sdk = useSDK()
  const { theme } = useTheme()
  const toast = useToast()

  const [rules, setRules] = createSignal<PermissionRule[]>([])
  const [, setRef] = createSignal<DialogSelectRef<PermissionRule>>()

  const refresh = () => {
    sdk.client.permission.listRuleset().then((result) => {
      setRules(result.data || [])
    }).catch((err) => {
      toast.show({ variant: "error", message: "Failed to load rules" })
    })
  }

  onMount(() => {
    refresh()
  })

  const options = createMemo(() => {
    return rules().map(
      (rule, index): DialogSelectOption<PermissionRule> => ({
        title: `${rule.permission} - ${rule.pattern} (${rule.action})`,
        value: rule,
        footer: "Press Delete / Backspace to remove this rule",
      })
    )
  })

  return (
    <DialogSelect
      ref={setRef}
      title="Saved Permissions"
      options={options()}
      placeholder={rules().length === 0 ? "No saved permissions" : undefined}
      keybind={[
        {
          title: "Delete",
          keybind: { name: "backspace", ctrl: false, meta: false, shift: false, super: false, leader: false },
          onTrigger: async (option) => {
             try {
              await sdk.client.permission.deleteRule({
                permissionRule: option.value,
              })
              toast.show({ variant: "info", message: "Rule deleted" })
              refresh()
            } catch (e) {
              toast.show({ variant: "error", message: "Failed to delete rule" })
            }
          }
        },
        {
          title: "Delete",
          keybind: { name: "delete", ctrl: false, meta: false, shift: false, super: false, leader: false },
          onTrigger: async (option) => {
             try {
              await sdk.client.permission.deleteRule({
                permissionRule: option.value,
              })
              toast.show({ variant: "info", message: "Rule deleted" })
              refresh()
            } catch (e) {
              toast.show({ variant: "error", message: "Failed to delete rule" })
            }
          }
        }
      ]}
    />
  )
}
