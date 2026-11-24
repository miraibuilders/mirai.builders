import { notifyStaff } from "./staff-alert";

type PublicFallbackDetails = {
  kind: string;
  route: string;
  reason?: string;
};

export async function withPublicFallback<T>(
  loader: () => Promise<T>,
  fallback: T,
  details: PublicFallbackDetails,
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    await notifyStaff(
      details.kind,
      { route: details.route, reason: details.reason ?? "data_unavailable" },
      error,
    );
    return fallback;
  }
}
