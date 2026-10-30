import React from "react"
import { TaskPriority } from "@/types"

export interface BadgeProps {
  children: React.ReactNode
  variant?: "priority" | "tag" | "sage"
  priority?: TaskPriority
  className?: string
  onClick?: () => void
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "tag",
  priority,
  className = "",
  onClick,
}) => {
  let badgeClass = "badge badge-tag"

  if (variant === "priority" && priority) {
    badgeClass = `badge badge-${priority}`
  } else if (variant === "sage") {
    badgeClass = "badge badge-low"
  }

  return (
    <span
      className={`${badgeClass} ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </span>
  )
}
