// =========================
//  STORAGE KEYS
// =========================
const USERS_KEY = "quotegray_users";           // { code: "<userCode>", journals: [...] }
const CURRENT_USER_KEY = "quotegray_current_user"; // active user code


// =========================
//  LOAD ALL USERS
// =========================
export function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);

  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


// =========================
//  REGISTER NEW USER
// =========================
export function registerUser(code) {
  const users = loadUsers();

  // check if already exists
  const exists = users.find(u => u.code === code);
  if (exists) return false;

  users.push({
    code,
    journals: []
  });

  saveUsers(users);
  return true;
}


// =========================
//  LOGIN USER
// =========================
export function verifyUser(code) {
  const users = loadUsers();
  return users.some(u => u.code === code);
}

export function saveCurrentUser(code) {
  localStorage.setItem(CURRENT_USER_KEY, code);
}

export function loadCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}


// =========================
//  JOURNALS FOR CURRENT USER
// =========================
export function loadJournalsForUser() {
  const code = loadCurrentUser();
  if (!code) return [];

  const users = loadUsers();
  const user = users.find(u => u.code === code);
  return user ? user.journals : [];
}

export function saveJournalsForUser(journals) {
  const code = loadCurrentUser();
  if (!code) return;

  const users = loadUsers();
  const user = users.find(u => u.code === code);
  if (!user) return;

  user.journals = journals;
  saveUsers(users);
}


// =========================
//  ACCESS CODE CHECK (for pages)
// =========================
export function loadAccessCode() {
  return loadCurrentUser();
}