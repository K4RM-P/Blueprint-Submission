"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/** Dark ink pill toasts with a mint success pebble (UI_UX_DESIGN §8). */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      duration={4000}
      className="toaster group"
      icons={{
        success: (
          <span className="grid size-7 place-items-center rounded-full bg-mint text-loop-deep"><CircleCheckIcon className="size-4" /></span>
        ),
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: (
          <span className="grid size-7 place-items-center rounded-full bg-[#fbe0e0] text-danger-ink"><OctagonXIcon className="size-4" /></span>
        ),
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-full !bg-ink !text-white !border-0 !px-5 !py-3 !gap-3 !shadow-[0_18px_40px_-16px_rgba(23,32,28,.55)] !text-[0.9375rem] !font-medium",
          description: "!text-white/75",
          actionButton: "!bg-white !text-ink !rounded-full",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
