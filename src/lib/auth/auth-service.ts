import { AuthUser, LoginCredentials, RegisterData, ResidentProfile } from "@/types";
import { db } from "../db/local-store";
import { SEED_USERS } from "../db/seed-data";

const SESSION_KEY = "ck_hub_session_v1";

class AuthService {
  private isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  getCurrentSession(): AuthUser | null {
    if (!this.isClient()) return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) {
        // First-time visit convenience: default to demo resident (Juan Dela Cruz)
        const defaultUser = SEED_USERS[0];
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(defaultUser));
        return defaultUser;
      }
      if (raw === "null") return null;
      return JSON.parse(raw) as AuthUser;
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

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const { emailOrPhone, password, role } = credentials;

    if (!emailOrPhone || !password) {
      throw new Error("Please enter your email or phone number and password.");
    }

    const cleanInput = emailOrPhone.trim();

    // Check staff admin credentials
    if (role === "admin" || cleanInput.toLowerCase() === "admin@ckcondohub.com") {
      const adminUser: AuthUser = {
        id: "usr-admin-1",
        email: "admin@ckcondohub.com",
        name: "Station 1 Front Desk Staff",
        phone: "0917 999 8888",
        role: "admin",
        createdAt: "2026-07-01T08:00:00Z",
      };
      this.setSession(adminUser);
      return { user: adminUser, token: "mock-jwt-admin-token" };
    }

    // Check existing users / residents in database
    const user = await db.findUserByCredentials(cleanInput);

    if (user) {
      this.setSession(user);
      return { user, token: `mock-jwt-${user.id}` };
    }

    // If user entered a realistic unregistered email/phone, return friendly error
    throw new Error("No account found matching this email or phone. Please verify your credentials or register.");
  }

  async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    if (!data.fullName || !data.email || !data.phone || !data.unit || !data.password) {
      throw new Error("Please fill in all required fields.");
    }

    // Check if email already registered
    const existing = await db.getResidentByEmailOrPhone(data.email);
    if (existing) {
      throw new Error("An account with this email or phone number already exists.");
    }

    // Generate resident code: CK-000XXX
    const randomCode = `CK-${Math.floor(100000 + Math.random() * 900000).toString().slice(0, 6)}`;

    const newResident = await db.createResident({
      name: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      unit: data.unit.trim(),
      tower: data.tower || "Tower A",
      building: "CK Buildersville Condominium",
      plan: data.plan || "REGULAR",
      residentCode: randomCode,
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
      plan: newResident.plan,
      residentCode: newResident.residentCode,
      createdAt: newResident.createdAt,
    };

    this.setSession(authUser);
    return { user: authUser, token: `mock-jwt-${authUser.id}` };
  }

  async logout(): Promise<void> {
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
      plan: updatedResident.plan,
      residentCode: updatedResident.residentCode,
      createdAt: updatedResident.createdAt,
    };
    this.setSession(updatedUser);
    return updatedUser;
  }
}

export const authService = new AuthService();
