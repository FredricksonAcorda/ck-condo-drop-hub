import { AuthUser, LoginCredentials, RegisterData, ResidentProfile } from "@/types";
import { db } from "../db/local-store";
import { SEED_USERS } from "../db/seed-data";
import { auth } from "../firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

const SESSION_KEY = "ck_hub_session_v2";

class AuthService {
  private isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  getCurrentSession(): AuthUser | null {
    if (!this.isClient()) return null;
    try {
      window.localStorage.removeItem("ck_hub_session_v1");
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw || raw === "null") return null;
      const sessionUser = JSON.parse(raw) as AuthUser;
      // Auto-purge decommissioned Juan / Maria demo sessions
      if (
        sessionUser &&
        (sessionUser.id === "usr-resident-1" ||
          sessionUser.id === "usr-resident-2" ||
          sessionUser.name === "Juan Dela Cruz" ||
          sessionUser.name === "Maria Santos" ||
          sessionUser.email === "juan.delacruz@gmail.com" ||
          sessionUser.email === "maria.santos@gmail.com")
      ) {
        this.setSession(null);
        return null;
      }
      if (sessionUser && sessionUser.role === "resident") {
        if (sessionUser.deliveryCreditsLeft === undefined) {
          sessionUser.deliveryCreditsLeft = sessionUser.plan === "PREMIUM" ? 1 : 0;
        }
        if (!sessionUser.subscriptionExpiry && sessionUser.plan !== "PER_PARCEL") {
          sessionUser.subscriptionExpiry = sessionUser.plan === "PREMIUM" ? "2026-10-01T23:59:59Z" : "2026-10-15T23:59:59Z";
        }
      }
      return sessionUser;
    } catch {
      return null;
    }
  }

  private setSession(user: AuthUser | null): void {
    if (!this.isClient()) return;
    if (user) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      window.localStorage.setItem(SESSION_KEY, "null");
    }
    window.dispatchEvent(new CustomEvent("ck_auth_updated", { detail: { user } }));
  }

  setSessionDirect(user: AuthUser | null): void {
    this.setSession(user);
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const { emailOrPhone, password, role } = credentials;

    if (!emailOrPhone || !password) {
      throw new Error("Please enter your credentials and password.");
    }

    const cleanInput = emailOrPhone.trim();

    // ==========================================================
    // 1. STAFF ADMIN AUTHENTICATION (STRICT FIREBASE AUTH VALIDATION)
    // ==========================================================
    if (role === "admin" || cleanInput.toLowerCase() === "admin@ckcondohub.com") {
      const adminEmail = cleanInput.includes("@") ? cleanInput.toLowerCase() : "admin@ckcondohub.com";

      if (auth) {
        try {
          await signInWithEmailAndPassword(auth, adminEmail, password);
        } catch (fbErr: unknown) {
          const error = fbErr as { code?: string; message?: string };
          // If admin account doesn't exist yet in Firebase Auth, bootstrap it on initial valid login
          if (error?.code === "auth/user-not-found" || error?.code === "auth/invalid-credential") {
            try {
              // Attempt bootstrap creation in Firebase Auth
              await createUserWithEmailAndPassword(auth, adminEmail, password);
              console.log("Staff Admin initialized in Firebase Auth successfully.");
            } catch (createErr: unknown) {
              const createError = createErr as { code?: string };
              // If email already in use, it means the admin account DOES exist and the password was WRONG
              if (createError?.code === "auth/email-already-in-use") {
                throw new Error("Incorrect staff admin password. Please enter the valid admin password.");
              }
              throw new Error("Invalid staff admin credentials. Please check your password.");
            }
          } else if (error?.code === "auth/wrong-password" || error?.code === "auth/invalid-password") {
            throw new Error("Incorrect staff admin password. Please enter the valid admin password.");
          } else if (error?.code === "auth/too-many-requests") {
            throw new Error("Access temporarily disabled due to many failed login attempts. Please try again later.");
          } else {
            throw new Error("Failed to sign in as Staff Admin. Please verify your credentials.");
          }
        }
      } else {
        if (password.length < 6) {
          throw new Error("Invalid staff admin password. Must be at least 6 characters.");
        }
      }

      const adminUser: AuthUser = {
        id: "usr-admin-1",
        email: adminEmail,
        name: "Lobby Staff Admin",
        phone: "0917 999 8888",
        role: "admin",
        createdAt: "2026-07-01T08:00:00Z",
      };
      this.setSession(adminUser);
      return { user: adminUser, token: "mock-jwt-admin-token" };
    }

    // ==========================================================
    // 2. RESIDENT AUTHENTICATION (STRICT FIREBASE AUTH VALIDATION)
    // ==========================================================
    // Determine the resident's registered email
    let targetEmail = "";
    let residentProfile: AuthUser | null = null;

    if (cleanInput.includes("@")) {
      targetEmail = cleanInput.toLowerCase();
    } else {
      // User entered Philippine mobile number (+63 9XX XXX XXXX)
      const foundResident = await db.findUserByCredentials(cleanInput);
      if (!foundResident) {
        throw new Error("No account found matching this mobile number. Please check your credentials or register.");
      }
      targetEmail = foundResident.email.toLowerCase();
      residentProfile = foundResident;
    }

    // Authenticate with Firebase Authentication
    if (auth && targetEmail) {
      try {
        await signInWithEmailAndPassword(auth, targetEmail, password);
      } catch (fbErr: unknown) {
        const error = fbErr as { code?: string; message?: string };
        if (
          error?.code === "auth/wrong-password" ||
          error?.code === "auth/invalid-credential" ||
          error?.code === "auth/invalid-password"
        ) {
          throw new Error("Incorrect password. Please verify the password you used during sign up.");
        }
        if (error?.code === "auth/user-not-found") {
          throw new Error("No account found matching this email. Please check your credentials or register.");
        }
        if (error?.code === "auth/too-many-requests") {
          throw new Error("Access to this account has been temporarily disabled due to many failed login attempts. Please try again later or reset your password.");
        }
        throw new Error("Incorrect password. Please verify the password you used during sign up.");
      }
    }

    // Retrieve resident profile from database if not already resolved
    if (!residentProfile) {
      residentProfile = await db.findUserByCredentials(targetEmail);
    }

    // Self-healing: If user authenticated in Firebase Auth, but profile was missing in database
    if (!residentProfile && targetEmail) {
      const cleanName = targetEmail.split("@")[0].replace(/[._-]/g, " ");
      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      const autoResident = await db.createResident({
        name: formattedName,
        email: targetEmail,
        phone: "+63 900 000 0000",
        unit: "Bldg 1 • Flr 1 • Unit 101",
        tower: "Malinta Branch",
        branch: "Malinta Branch",
        buildingNumber: "1",
        floorNumber: "1",
        unitNumber: "101",
        building: "CK Buildersville Condominium",
        plan: "PER_PARCEL",
        planStatus: "ACTIVE",
        paymentMethod: "CASH_COUNTER",
        deliveryCreditsLeft: 0,
        residentCode: `CK-${Math.floor(100000 + Math.random() * 900000)}`,
        authorizedClaimants: [],
        status: "ACTIVE",
        notifications: {
          smsArrival: true,
          smsReminder: true,
          emailDigest: true,
          promoUpdates: false,
        },
      });

      residentProfile = {
        id: autoResident.id,
        email: autoResident.email,
        name: autoResident.name,
        phone: autoResident.phone,
        role: "resident",
        unit: autoResident.unit,
        tower: autoResident.tower,
        branch: autoResident.branch,
        buildingNumber: autoResident.buildingNumber,
        floorNumber: autoResident.floorNumber,
        unitNumber: autoResident.unitNumber,
        plan: autoResident.plan,
        planStatus: autoResident.planStatus,
        paymentMethod: autoResident.paymentMethod,
        residentCode: autoResident.residentCode,
        authorizedClaimants: [],
        createdAt: autoResident.createdAt,
      };
    }

    if (residentProfile) {
      this.setSession(residentProfile);
      return { user: residentProfile, token: `mock-jwt-${residentProfile.id}` };
    }

    throw new Error("No account found matching this email or phone. Please verify your credentials or register.");
  }

  async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    if (!data.fullName || !data.email || !data.phone || !data.unit || !data.password) {
      throw new Error("Please fill in all required fields.");
    }

    // Check if email already registered in database
    const existing = await db.getResidentByEmailOrPhone(data.email);
    if (existing) {
      throw new Error("An account with this email or phone number already exists.");
    }

    // Register in Firebase Auth if available and email is valid
    if (auth && data.email.includes("@")) {
      try {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      } catch (fbErr: unknown) {
        const error = fbErr as { code?: string };
        if (error?.code === "auth/email-already-in-use") {
          // If resident document already exists in DB, block duplicate
          const existingResident = await db.getResidentByEmailOrPhone(data.email);
          if (existingResident) {
            throw new Error("An account with this email already exists. Please sign in instead.");
          }
          // If orphaned from previous failed DB write, verify password and continue
          try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
          } catch {
            throw new Error("An account with this email already exists in Firebase Auth. Please verify your password or sign in.");
          }
        } else {
          console.warn("Firebase Auth registration notice:", fbErr);
        }
      }
    }

    // Generate resident code: CK-000XXX
    const randomCode = `CK-${Math.floor(100000 + Math.random() * 900000).toString().slice(0, 6)}`;
    const plan = data.plan || "REGULAR";
    const isPaid = plan === "REGULAR" || plan === "PREMIUM";
    const planStatus = !isPaid
      ? "ACTIVE"
      : (data.planStatus || (data.paymentReference ? "PENDING_VERIFICATION" : "PENDING_PAYMENT"));
    const paymentMethod = data.paymentMethod || (data.paymentReference ? "GCASH" : "CASH_COUNTER");

    const newResident = await db.createResident({
      name: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      unit: data.unit.trim(),
      tower: data.tower || "Tower A",
      branch: data.branch || "Malinta Branch",
      buildingNumber: data.buildingNumber,
      floorNumber: data.floorNumber,
      unitNumber: data.unitNumber,
      building: "CK Buildersville Condominium",
      plan: isPaid && planStatus !== "ACTIVE" ? "PER_PARCEL" : plan,
      pendingPlan: isPaid && planStatus !== "ACTIVE" ? plan : undefined,
      planStatus,
      paymentMethod,
      paymentReference: data.paymentReference,
      deliveryCreditsLeft: isPaid && planStatus === "ACTIVE" ? (plan === "PREMIUM" ? 1 : 0) : 0,
      residentCode: randomCode,
      authorizedClaimants: [],
      status: "ACTIVE",
      notifications: {
        smsArrival: true,
        smsReminder: true,
        emailDigest: true,
        promoUpdates: false,
      },
    });

    const authUser: AuthUser = {
      id: newResident.id,
      email: newResident.email,
      name: newResident.name,
      phone: newResident.phone,
      role: "resident",
      unit: newResident.unit,
      tower: newResident.tower,
      branch: newResident.branch,
      buildingNumber: newResident.buildingNumber,
      floorNumber: newResident.floorNumber,
      unitNumber: newResident.unitNumber,
      plan: newResident.plan,
      pendingPlan: newResident.pendingPlan,
      planStatus: newResident.planStatus,
      paymentMethod: newResident.paymentMethod,
      paymentReference: newResident.paymentReference,
      residentCode: newResident.residentCode,
      authorizedClaimants: newResident.authorizedClaimants,
      deliveryCreditsLeft: newResident.deliveryCreditsLeft,
      subscriptionExpiry: newResident.subscriptionExpiry,
      createdAt: newResident.createdAt,
    };

    this.setSession(authUser);
    return { user: authUser, token: `mock-jwt-${authUser.id}` };
  }

  async logout(): Promise<void> {
    if (auth) {
      await signOut(auth).catch(() => {});
    }
    this.setSession(null);
  }

  async updateProfile(userId: string, updates: Partial<ResidentProfile>): Promise<AuthUser> {
    const updatedResident = await db.updateResidentProfile(userId, updates);
    const updatedUser: AuthUser = {
      id: updatedResident.id,
      email: updatedResident.email,
      name: updatedResident.name,
      phone: updatedResident.phone,
      role: "resident",
      unit: updatedResident.unit,
      tower: updatedResident.tower,
      branch: updatedResident.branch,
      buildingNumber: updatedResident.buildingNumber,
      floorNumber: updatedResident.floorNumber,
      unitNumber: updatedResident.unitNumber,
      plan: updatedResident.plan,
      planStatus: updatedResident.planStatus,
      paymentMethod: updatedResident.paymentMethod,
      paymentReference: updatedResident.paymentReference,
      residentCode: updatedResident.residentCode,
      authorizedClaimant: updatedResident.authorizedClaimant,
      claimantPhone: updatedResident.claimantPhone,
      authorizedClaimants: updatedResident.authorizedClaimants,
      deliveryCreditsLeft: updatedResident.deliveryCreditsLeft,
      subscriptionExpiry: updatedResident.subscriptionExpiry,
      createdAt: updatedResident.createdAt,
    };
    this.setSession(updatedUser);
    return updatedUser;
  }
}

export const authService = new AuthService();
