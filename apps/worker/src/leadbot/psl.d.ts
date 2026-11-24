declare module "psl" {
  type ParsedDomain = {
    domain: string | null;
    subdomain: string | null;
    tld: string | null;
    sld: string | null;
    error: { message?: string } | null;
  };

  const psl: {
    parse(input: string): ParsedDomain;
    get(input: string): string | null;
  };

  export default psl;
}
