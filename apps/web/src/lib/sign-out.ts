export async function signOut() {
  await fetch("/api/auth/sign-out", { method: "POST" });
  window.location.assign("/login");
}
