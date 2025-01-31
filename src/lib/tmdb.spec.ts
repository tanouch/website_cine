import { describe, expect, it } from "vitest";

import { getMovieDetailsFromTmdb } from "./tmdb";

describe("tmdb", () => {
  it("should work", async () => {
    expect(
      await getMovieDetailsFromTmdb({
        title: "Frankenstein",
        year: "1931",
      }),
    ).toEqual({
      wikipediaEnUrl: "https://en.wikipedia.org/wiki/Frankenstein_(1931_film)",
      wikipediaFrUrl: "https://fr.wikipedia.org/wiki/Frankenstein_(film,_1931)",
      image: {
        aspect_ratio: 1.778,
        file_path: "/wFbPbJ9uRDpjY7micBTeolgkOA4.jpg",
        height: 1080,
        iso_639_1: null,
        url: "https://image.tmdb.org/t/p//w780//wFbPbJ9uRDpjY7micBTeolgkOA4.jpg",
        width: 1920,
      },
      movie: {
        genres: ["Drame", "Horreur", "Science-Fiction"],
        id: 3035,
        original_language: "en",
        original_title: "Frankenstein",
        overview:
          "Le jeune savant Henry Frankenstein parvient, à partir de restes humains assemblés, à donner vie à une créature.",
        popularity: 22.397,
        release_date: "1931-11-21",
        title: "Frankenstein",
      },
    });
  });
});
