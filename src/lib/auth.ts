import { UserProfile, SignUpData, AuthCredentials, UpdateProfileData } from '../types/auth';

const STORAGE_CURRENT_USER_KEY = 'pulse_current_user';
const STORAGE_USER_REGISTRY_KEY = 'pulse_user_registry';

// Canonical Super Admin credentials
export const SUPER_ADMIN_EMAIL = 'devendrs2313@gmail.com';
export const SUPER_ADMIN_PASSWORD = 'Lolyouhacked@69';

// Default initial seeded users - only the Super Admin account is kept
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_admin_01',
    name: 'Devendra',
    email: 'devendrs2313@gmail.com',
    role: 'Engineering Leader',
    headline: 'Founder & Super Admin',
    city: 'delhi-ncr',
    formats: ['offline', 'online'],
    categories: ['Product Management', 'AI / ML', 'Engineering'],
    emailAlerts: true,
    isAdmin: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createdAt: '2026-09-18T10:00:00.000Z',
    lastActiveAt: new Date().toISOString()
  }
];

/**
 * Load user registry from local storage (purges any legacy dummy seed users)
 */
export function getRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_USER_REGISTRY_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USER_REGISTRY_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Clean out legacy demo seed users
      const cleaned = parsed.filter(u => {
        if (!u || !u.id || !u.email) return false;
        if (u.id.startsWith('user_seed_')) return false;
        const lower = u.email.toLowerCase();
        if (lower === 'aarav.sharma@techcorp.in' || lower === 'priyanka.v@cloudscale.io' || lower === 'rohan.mehta@buildfast.ai') {
          return false;
        }
        return true;
      });

      // Ensure super admin always exists in registry
      const hasAdmin = cleaned.some(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
      const finalUsers = hasAdmin ? cleaned : [INITIAL_USERS[0], ...cleaned];
      localStorage.setItem(STORAGE_USER_REGISTRY_KEY, JSON.stringify(finalUsers));
      return finalUsers;
    }
    return INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

/**
 * Save user registry to local storage
 */
function saveUserRegistry(users: UserProfile[]) {
  try {
    localStorage.setItem(STORAGE_USER_REGISTRY_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving user registry:', e);
  }
}

/**
 * Get currently authenticated user
 */
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persist current user session
 */
export function setCurrentUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}

/**
 * Sign In with email & password
 */
export async function signIn(credentials: AuthCredentials): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const emailNorm = credentials.email.trim().toLowerCase();
  const password = credentials.password.trim();

  // 1. Super Admin authentication
  if (emailNorm === SUPER_ADMIN_EMAIL.toLowerCase()) {
    if (password === SUPER_ADMIN_PASSWORD) {
      const adminUser: UserProfile = {
        id: 'user_admin_01',
        name: 'Devendra',
        email: 'devendrs2313@gmail.com',
        role: 'Engineering Leader',
        headline: 'Founder & Super Admin',
        city: 'delhi-ncr',
        formats: ['offline', 'online'],
        categories: ['Product Management', 'AI / ML', 'Engineering'],
        emailAlerts: true,
        isAdmin: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: '2026-09-18T10:00:00.000Z',
        lastActiveAt: new Date().toISOString()
      };
      setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    } else {
      return { success: false, error: 'Incorrect password for Super Admin account.' };
    }
  }

  // 2. Regular user sign-in from registry
  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === emailNorm);
  if (!found) {
    return { success: false, error: 'No account found with this email. Please sign up.' };
  }

  const updatedUser: UserProfile = {
    ...found,
    lastActiveAt: new Date().toISOString()
  };
  setCurrentUser(updatedUser);
  return { success: true, user: updatedUser };
}

/**
 * Sign Up new user profile with personal automation preferences
 */
export async function signUp(data: SignUpData): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const emailNorm = data.email.trim().toLowerCase();

  if (!data.name.trim()) {
    return { success: false, error: 'Please enter your full name.' };
  }

  if (!emailNorm || !emailNorm.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const users = getRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase() === emailNorm);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const isSuperAdmin = emailNorm === SUPER_ADMIN_EMAIL.toLowerCase();

  const newUser: UserProfile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    email: data.email.trim(),
    role: data.role,
    headline: `${data.role} in ${data.city}`,
    city: data.city,
    formats: data.formats && data.formats.length > 0 ? data.formats : ['offline', 'online'],
    categories: data.categories || [],
    emailAlerts: data.emailAlerts ?? true,
    isAdmin: isSuperAdmin,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=4f46e5`,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  const updatedUsers = [newUser, ...users];
  saveUserRegistry(updatedUsers);
  setCurrentUser(newUser);

  // Sync to Supabase if configured
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          city: newUser.city,
          mode: newUser.formats.length === 2 ? 'both' : (newUser.formats[0] || 'both'),
          categories: newUser.categories,
          is_admin: newUser.isAdmin,
          created_at: newUser.createdAt,
          last_active_at: newUser.lastActiveAt
        })
      }).catch(err => console.warn('[Supabase Profiles Sync Error]:', err));
    }
  } catch (e) {
    // Non-blocking
  }

  return { success: true, user: newUser };
}

/**
 * Sign Out
 */
export function signOut(): void {
  setCurrentUser(null);
}

/**
 * Update authenticated user's profile details & automation preferences
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UpdateProfileData>
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const current = getCurrentUser();
    if (!current || current.id !== userId) {
      return { success: false, error: 'User session not found or mismatch.' };
    }

    const updatedUser: UserProfile = {
      ...current,
      name: data.name !== undefined ? data.name.trim() : current.name,
      role: data.role !== undefined ? data.role : current.role,
      headline: data.headline !== undefined ? data.headline.trim() : current.headline,
      city: data.city !== undefined ? data.city : current.city,
      formats: data.formats && data.formats.length > 0 ? data.formats : current.formats,
      categories: data.categories !== undefined ? data.categories : current.categories,
      emailAlerts: data.emailAlerts !== undefined ? data.emailAlerts : current.emailAlerts,
      lastActiveAt: new Date().toISOString()
    };

    // 1. Save session
    setCurrentUser(updatedUser);

    // 2. Update user directory registry
    const registry = getRegisteredUsers();
    const updatedRegistry = registry.map(u => (u.id === userId ? updatedUser : u));
    if (!updatedRegistry.some(u => u.id === userId)) {
      updatedRegistry.unshift(updatedUser);
    }
    saveUserRegistry(updatedRegistry);

    // 3. Sync to Supabase profiles table if configured
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && anonKey) {
        fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            name: updatedUser.name,
            role: updatedUser.role,
            city: updatedUser.city,
            mode: updatedUser.formats.length === 2 ? 'both' : (updatedUser.formats[0] || 'both'),
            categories: updatedUser.categories,
            last_active_at: updatedUser.lastActiveAt
          })
        }).catch(err => console.warn('[Supabase Profile Update Error]:', err));
      }
    } catch {
      // Non-blocking
    }

    return { success: true, user: updatedUser };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update profile.' };
  }
}
