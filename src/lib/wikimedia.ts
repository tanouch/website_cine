import createClient from "openapi-fetch";
import { z } from "zod";

import type { paths } from "./wikidata.d.ts";

const client = createClient<paths>({
  baseUrl: "https://www.wikidata.org/w/rest.php/wikibase",
});

const sitelinksSchema = z
  .object({
    enwiki: z
      .object({
        url: z.string(),
      })
      .optional(),
    frwiki: z
      .object({
        url: z.string(),
      })
      .optional(),
  })
  .optional();

export async function getWikipediaUrls({ wikidataId }: { wikidataId: string }) {
  const response = await client.GET("/v1/entities/items/{item_id}", {
    params: {
      path: {
        item_id: wikidataId,
      },
    },
  });

  return sitelinksSchema.parse(response?.data?.sitelinks);
}
