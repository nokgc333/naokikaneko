import type { UseFormRegisterReturn } from "react-hook-form";

type ContactFieldProps = {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: string;
  rows?: number;
};

const FIELD_CLASS = "mt-1 block w-full border border-border p-2";

export default function ContactField({
  id,
  label,
  registration,
  error,
  type,
  rows,
}: ContactFieldProps) {
  const sharedProps = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": `${id}-error`,
    className: FIELD_CLASS,
    ...registration,
  } as const;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {rows ? <textarea rows={rows} {...sharedProps} /> : <input type={type} {...sharedProps} />}
      <p id={`${id}-error`} role="alert" className="mt-1 min-h-5 text-sm text-destructive">
        {error}
      </p>
    </div>
  );
}
