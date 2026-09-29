import { IDatabaseService } from "./db-interface";
import { LocalDatabaseService } from "./local-store";
import {
  FirestoreDatabaseService,
  subscribeToResidents,
  subscribeToParcels,
} from "./firestore-store";
import { isFirebaseConfigured } from "../firebase/config";

let dbInstance: IDatabaseService;

if (isFirebaseConfigured()) {
  dbInstance = new FirestoreDatabaseService();
} else {
  dbInstance = new LocalDatabaseService();
}

export const db: IDatabaseService = dbInstance;
export {
  LocalDatabaseService,
  FirestoreDatabaseService,
  subscribeToResidents,
  subscribeToParcels,
};
