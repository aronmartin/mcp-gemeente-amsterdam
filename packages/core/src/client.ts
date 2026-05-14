const BASE_URL = "https://api.data.amsterdam.nl";

export type DsoPage<T> = {
  _embedded: Record<string, T[]>;
  _links: { self?: { href: string }; next?: { href: string } };
  page: { number: number; size: number; totalElements?: number; totalPages?: number };
};

export type QueryParams = {
  page?: number;
  page_size?: number;
  _fields?: string;
  _expand?: boolean;
  _expandScope?: string;
  _sort?: string;
  [key: string]: unknown;
};

export class AmsClient {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.AMSTERDAM_API_KEY;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { Accept: "application/hal+json" };
    if (this.apiKey) h["X-Api-Key"] = this.apiKey;
    return h;
  }

  private buildUrl(path: string, params?: QueryParams): string {
    const url = new URL(path, BASE_URL);
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        if (val === undefined || val === null) continue;
        url.searchParams.set(key, String(val));
      }
    }
    return url.toString();
  }

  async list<T>(
    dataset: string,
    collection: string,
    params?: QueryParams
  ): Promise<DsoPage<T>> {
    const url = this.buildUrl(`/v1/${dataset}/${collection}/`, params);
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Amsterdam API ${dataset}/${collection} ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json() as Promise<DsoPage<T>>;
  }

  async get<T>(dataset: string, collection: string, id: string | number): Promise<T> {
    const url = this.buildUrl(`/v1/${dataset}/${collection}/${id}/`);
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Amsterdam API ${dataset}/${collection}/${id} ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json() as Promise<T>;
  }
}

export const defaultClient = new AmsClient();
