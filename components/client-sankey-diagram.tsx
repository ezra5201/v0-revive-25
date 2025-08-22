"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal } from "d3-sankey"

interface ContactRecord {
  id: number
  date: string
  daysAgo: number
  provider: string
  client: string
  category: string
  servicesRequested?: string[]
  servicesProvided?: Array<{
    service: string
    provider: string
    completedAt: string
  }>
  comments?: string
}

interface SankeyNode {
  id: string
  name: string
  type: "contact" | "service"
  date?: string
  provider?: string
  value?: number
}

interface SankeyLink {
  source: string
  target: string
  value: number
}

interface ClientSankeyDiagramProps {
  clientName: string
  contactHistory: ContactRecord[]
}

export function ClientSankeyDiagram({ clientName, contactHistory }: ClientSankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const processData = () => {
    const nodes: SankeyNode[] = []
    const links: SankeyLink[] = []
    const serviceCount: Record<string, number> = {}

    // Create contact nodes and service connections
    contactHistory.forEach((contact, index) => {
      const contactId = `contact-${contact.id}`
      const contactName = `${new Date(contact.date).toLocaleDateString()} - ${contact.provider}`

      // Add contact node
      nodes.push({
        id: contactId,
        name: contactName,
        type: "contact",
        date: contact.date,
        provider: contact.provider,
      })

      // Process services provided
      const allServices = [
        ...(contact.servicesRequested || []),
        ...(contact.servicesProvided?.map((s) => s.service) || []),
      ]

      const uniqueServices = [...new Set(allServices)]

      uniqueServices.forEach((service) => {
        const serviceId = `service-${service}`

        // Count service occurrences
        serviceCount[service] = (serviceCount[service] || 0) + 1

        // Add service node if not exists
        if (!nodes.find((n) => n.id === serviceId)) {
          nodes.push({
            id: serviceId,
            name: service,
            type: "service",
            value: 0,
          })
        }

        // Add link from contact to service
        const existingLink = links.find((l) => l.source === contactId && l.target === serviceId)
        if (existingLink) {
          existingLink.value += 1
        } else {
          links.push({
            source: contactId,
            target: serviceId,
            value: 1,
          })
        }
      })
    })

    // Update service node values
    nodes.forEach((node) => {
      if (node.type === "service") {
        node.value = serviceCount[node.name] || 0
      }
    })

    return { nodes, links }
  }

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: Math.max(600, container.clientHeight),
          })
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || contactHistory.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const { nodes, links } = processData()

    if (nodes.length === 0 || links.length === 0) return

    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId((d) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [1, 1],
        [width - 1, height - 6],
      ])

    // Generate sankey data
    const sankeyData = sankeyGenerator({
      nodes: nodes.map((d) => ({ ...d })),
      links: links.map((d) => ({ ...d })),
    })

    // Color scales
    const contactColor = d3.scaleOrdinal(d3.schemeCategory10)
    const serviceColor = d3.scaleOrdinal(d3.schemeSet3)

    // Draw links
    g.append("g")
      .selectAll("path")
      .data(sankeyData.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => {
        const sourceNode = d.source as any
        return sourceNode.type === "contact" ? contactColor(sourceNode.provider) : serviceColor(sourceNode.name)
      })
      .attr("stroke-width", (d) => Math.max(1, d.width || 0))
      .attr("stroke-opacity", 0.5)
      .attr("fill", "none")
      .append("title")
      .text((d) => {
        const sourceNode = d.source as any
        const targetNode = d.target as any
        return `${sourceNode.name} → ${targetNode.name}\n${d.value} connection${d.value > 1 ? "s" : ""}`
      })

    // Draw nodes
    const node = g
      .append("g")
      .selectAll("rect")
      .data(sankeyData.nodes)
      .join("rect")
      .attr("x", (d) => d.x0 || 0)
      .attr("y", (d) => d.y0 || 0)
      .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
      .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0))
      .attr("fill", (d) => (d.type === "contact" ? contactColor(d.provider || "") : serviceColor(d.name)))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .append("title")
      .text((d) => `${d.name}\n${d.value || 0} connection${(d.value || 0) > 1 ? "s" : ""}`)

    // Add labels
    g.append("g")
      .selectAll("text")
      .data(sankeyData.nodes)
      .join("text")
      .attr("x", (d) => ((d.x0 || 0) < width / 2 ? (d.x1 || 0) + 6 : (d.x0 || 0) - 6))
      .attr("y", (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => ((d.x0 || 0) < width / 2 ? "start" : "end"))
      .attr("font-size", "12px")
      .attr("font-family", "sans-serif")
      .text((d) => d.name)
      .filter((d) => (d.y1 || 0) - (d.y0 || 0) > 20) // Only show labels for larger nodes
  }, [dimensions, contactHistory])

  if (contactHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Contact Data</div>
          <div className="text-sm">No contact history available to visualize the client journey.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Client Journey Flow</h3>
        <p className="text-sm text-gray-600">
          Each contact flows to the services utilized, showing the client's service journey over time.
        </p>
      </div>
      <div className="w-full" style={{ height: dimensions.height || 600 }}>
        <svg ref={svgRef} width="100%" height="100%" style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }} />
      </div>
    </div>
  )
}
