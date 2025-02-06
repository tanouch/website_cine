import { describe, expect, it } from "vitest";

import { getWikipediaUrls } from "./wikimedia";

describe("wikimedia", () => {
  it("should work", async () => {
    expect(await getWikipediaUrls({ wikidataId: "Q546829" })).toEqual({
      enwiki: {
        url: "https://en.wikipedia.org/wiki/Frankenstein_(1931_film)",
      },
      frwiki: {
        url: "https://fr.wikipedia.org/wiki/Frankenstein_(film,_1931)",
      },
    });
  });
});
