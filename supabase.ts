/**
 * Supabase Client
 * Config được lưu trong localStorage bởi Admin Panel
 * Cho phép thay đổi mà không cần rebuild
 */

const STORAGE_KEY = 'vs_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw);
    if (cfg.url && cfg.anonKey) return cfg;
    return null;
  } catch {
    return null;
  }
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Generic Supabase REST caller (không cần SDK - gọi thẳng REST API)
async function supabaseFetch(
  path: string,
  method: string = 'GET',
  body?: object,
  token?: string
): Promise<any> {
  const cfg = getSupabaseConfig();
  if (!cfg) throw new Error('Chưa cấu hình Supabase. Vào Admin để cài đặt.');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': cfg.anonKey,
    'Authorization': `Bearer ${token || cfg.anonKey}`,
  };

  // POST/PATCH need Prefer header to return inserted data
  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = 'return=representation';
  }

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error_description || 'Lỗi Supabase');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── AUTH FUNCTIONS ─────────────────────────────────────────

export interface VsUser {
  id: string;
  email: string;
  phone: string;
  created_at: string;
}

/** Đăng ký user mới */
export async function registerUser(email: string, phone: string, password: string): Promise<VsUser> {
  // Kiểm tra email tồn tại
  const existing = await supabaseFetch(`vs_users?email=eq.${encodeURIComponent(email)}&select=id`);
  if (existing && existing.length > 0) throw new Error('Email này đã được đăng ký.');

  // Tạo user mới (password hash đơn giản bằng btoa - production nên dùng bcrypt)
  const passwordHash = btoa(password + email); // simple hash for demo
  const users = await supabaseFetch('vs_users', 'POST', {
    email,
    phone,
    password: passwordHash,
  });

  return users?.[0] || { id: '', email, phone, created_at: new Date().toISOString() };
}

/** Đăng nhập */
export async function loginUser(email: string, password: string): Promise<VsUser> {
  const passwordHash = btoa(password + email);
  const users = await supabaseFetch(
    `vs_users?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(passwordHash)}&select=id,email,phone,created_at`
  );

  if (!users || users.length === 0) throw new Error('Email hoặc mật khẩu không đúng.');
  return users[0];
}

/** Lấy danh sách users (Admin) */
export async function getAllUsers(): Promise<VsUser[]> {
  return await supabaseFetch('vs_users?select=id,email,phone,created_at&order=created_at.desc');
}

/** Test kết nối Supabase */
export async function testConnection(): Promise<boolean> {
  try {
    await supabaseFetch('vs_users?select=id&limit=1');
    return true;
  } catch {
    return false;
  }
}

// ─── SQL để tạo bảng trong Supabase ─────────────────────────
export const SETUP_SQL = `-- Chạy trong Supabase SQL Editor
CREATE TABLE IF NOT EXISTS vs_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Cho phép insert không cần auth
ALTER TABLE vs_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all" ON vs_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select by email+password" ON vs_users
  FOR SELECT USING (true);`;
