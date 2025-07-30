"use client"

import type { ReactNode } from "react"

interface ServiceTooltipProps {
  children: ReactNode
  content: string
  className?: string
}

export function ServiceTooltip({ children, content, className = "" }: ServiceTooltipProps) {
  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}
