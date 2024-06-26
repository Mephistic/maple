import * as functions from "firebase-functions"
import { subscribeToOrgTopic } from "./subscribeToOrgTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

export const followOrg = functions.https.onCall(async (data, context) => {
  // Debug: Log the received data
  console.log("Debug: Data received in followOrg:", data)

  // Check for authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    )
  }

  // Runtime check for 'orgLookup' property
  if (!data.hasOwnProperty("orgLookup")) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "orgLookup must be provided."
    )
  }

  const user: UserRecord = await getAuth().getUser(context.auth.uid)
  const orgLookup = data.orgLookup
  const db: Firestore = getFirestore()

  try {
    await subscribeToOrgTopic({ user, orgLookup, db })
    return { status: "success", message: "Org subscription added" }
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to subscribe to org",
      { details: error.message }
    )
  }
})
