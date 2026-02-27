const PASSCODE_KEY = "app_passcode";
const LOCKED_KEY = "app_locked";

export function getPasscode(): string | null {
  return localStorage.getItem(PASSCODE_KEY);
}

export function setPasscode(code: string) {
  localStorage.setItem(PASSCODE_KEY, code);
  localStorage.setItem(LOCKED_KEY, "true");
}

export function removePasscode() {
  localStorage.removeItem(PASSCODE_KEY);
  localStorage.removeItem(LOCKED_KEY);
}

export function isPasscodeEnabled(): boolean {
  return !!localStorage.getItem(PASSCODE_KEY);
}

export function verifyPasscode(input: string): boolean {
  return localStorage.getItem(PASSCODE_KEY) === input;
}

export function isAppLocked(): boolean {
  return localStorage.getItem(LOCKED_KEY) === "true" && isPasscodeEnabled();
}

export function unlockApp() {
  localStorage.setItem(LOCKED_KEY, "false");
}

export function lockApp() {
  if (isPasscodeEnabled()) {
    localStorage.setItem(LOCKED_KEY, "true");
  }
}
