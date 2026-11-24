export type SiteFormErrors = Record<string, string>;

export type SiteFormState = {
  status: "idle" | "error";
  message: string;
  errors: SiteFormErrors;
};

export const initialSiteFormState: SiteFormState = {
  status: "idle",
  message: "",
  errors: {},
};
