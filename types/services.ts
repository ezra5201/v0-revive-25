export interface ServiceData {
  service: string
  provided: number
  requested: number
  completionRate: number
}

export type ServicesResponse = ServiceData[]
