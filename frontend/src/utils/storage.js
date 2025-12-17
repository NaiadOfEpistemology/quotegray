/* eslint-disable no-unused-vars */
const USERS_KEY="quotegray_users";           
const USERS_TEMP_KEY="quotegray_users_temp"; 
const USERS_BACKUP_KEY="quotegray_users_backup"; 
const CURRENT_USER_KEY="quotegray_current_user"; 
function safeParse(raw) {
  try {
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
    return false;
  }
}

function backupUsers(users) {
  try {
    const raw=localStorage.getItem(USERS_KEY);
    if (raw) localStorage.setItem(USERS_BACKUP_KEY, raw);
  } catch (err) {
    console.warn("Could not create backup:", err);
  }
}

function atomicSaveUsers(users) {
  if (!Array.isArray(users)) {
    console.error("Users data is invalid. Aborting save.");
    return false;
  }

  backupUsers(users);

  if (!safeSetItem(USERS_TEMP_KEY, users)) return false;

  const tempData=safeParse(localStorage.getItem(USERS_TEMP_KEY));
  if (!Array.isArray(tempData)) {
    console.error("Temporary save validation failed. Aborting.");
    return false;
  }

  return safeSetItem(USERS_KEY, tempData);
}

export function loadUsers() {
  return safeParse(localStorage.getItem(USERS_KEY));
}

export function saveUsers(users) {
  return atomicSaveUsers(users);
}

export function registerUser(code) {
  const users=loadUsers();
  if (users.some(u => u.code === code)) return false;

  users.push({ code, journals: [] });
  return saveUsers(users);
}

export function verifyUser(code) {
  return loadUsers().some(u => u.code === code);
}

export function saveCurrentUser(code) {
  localStorage.setItem(CURRENT_USER_KEY, code);
}

export function loadCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function loadJournalsForUser() {
  const code=loadCurrentUser();
  if (!code) return [];

  const user=loadUsers().find(u => u.code === code);
  return user?.journals ?? [];
}

export function saveJournalsForUser(journals) {
  const code=loadCurrentUser();
  if (!code) return false;

  const users=loadUsers();
  const user=users.find(u => u.code === code);
  if (!user) return false;

  user.journals=journals;
  return saveUsers(users);
}

export function loadAccessCode() {
  return loadCurrentUser();
}

export function restoreUsersFromBackup() {
  const backup=safeParse(localStorage.getItem(USERS_BACKUP_KEY));
  if (backup.length > 0) {
    return saveUsers(backup);
  }
  return false;
}
