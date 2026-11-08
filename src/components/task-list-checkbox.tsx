import type { ComponentProps } from "react";

export default function TaskListCheckbox(props: ComponentProps<"input">) {
  if (props.type !== "checkbox") {
    return <input {...props} />;
  }
  return <input {...props} aria-label={props.checked ? "完了" : "未完了"} />;
}
