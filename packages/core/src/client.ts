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

  /** Fetches all pages for a query, following _links.next up to maxPages.
   *  Forces page_size=1000 to minimise round-trips. Strips the user-supplied
   *  `page` param so we always start from page 1.
   */
  async listAll<T>(
    dataset: string,
    collection: string,
    params?: QueryParams,
    maxPages = 5,
  ): Promise<DsoPage<T>> {
    const fetchParams: QueryParams = { ...params, page_size: 1000 };
    delete fetchParams.page;

    const first = await this.list<T>(dataset, collection, fetchParams);
    const key = Object.keys(first._embedded ?? {})[0];
    if (!key || !first._links?.next?.href) return first;

    const all: T[] = [...((first._embedded[key] as T[]) ?? [])];
    let nextHref: string | undefined = first._links.next.href;
    let n = 1;

    while (nextHref && n < maxPages) {
      const res = await fetch(nextHref, { headers: this.headers() });
      if (!res.ok) break;
      const pg = (await res.json()) as DsoPage<T>;
      all.push(...((pg._embedded?.[key] as T[]) ?? []));
      nextHref = pg._links?.next?.href;
      n++;
    }

    return {
      ...first,
      _embedded: { [key]: all },
      page: { ...first.page, size: all.length, number: 1 },
      _links: { self: first._links?.self },
    };
  }
}

export const defaultClient = new AmsClient();
