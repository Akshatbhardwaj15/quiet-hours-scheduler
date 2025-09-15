import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("quiet_hours_scheduler")
}

// Types for MongoDB collections
export interface NotificationQueue {
  _id?: string
  studyBlockId: string
  userId: string
  userEmail: string
  userName: string
  studyBlockTitle: string
  studyBlockDescription?: string
  scheduledTime: Date
  studyStartTime: Date
  studyEndTime: Date
  status: "pending" | "sent" | "failed"
  attempts: number
  lastAttempt?: Date
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface EmailLog {
  _id?: string
  notificationId: string
  userId: string
  userEmail: string
  subject: string
  status: "sent" | "failed"
  error?: string
  sentAt: Date
}
