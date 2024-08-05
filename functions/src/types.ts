import type * as firebase from "./firebase"
import type * as api from "./malegislature"

export type Database = typeof firebase.db
export type Auth = typeof firebase.auth
export type Api = typeof api

export type Context = {
  env: "dev" | "prod" | "local"
  db: Database
  auth: Auth
  api: Api
}

export type EventData = {
  index: number
  type: "hearing" | "session"
  name: string
  id: number
  location: string
  fullDate: Date // TODO: Could be a timestamp
  year: string
  month: string
  date: string
  day: string
  time: string
  relatedBills?: RelatedBill[]
  relatedOrgs?: RelatedOrg[]
}

// types for Bills and Orgs
export type RelatedBill = {
  id: string
  court: number
}

export type RelatedOrg = {
  id: string
}
