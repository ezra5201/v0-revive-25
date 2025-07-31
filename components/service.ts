export interface Service {
  name: string
  status: "provided" | "requested" | "available_unused" | "not_requested"
  provider?: string
  completedAt?: string
}
