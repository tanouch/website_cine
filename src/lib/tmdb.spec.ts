import { describe, expect, it } from "vitest";

import { _getMovieDetailsFromTmdb } from "./tmdb";

describe("tmdb", () => {
  it("should disambiguate by director", async () => {
    const maria1BothDirs = await _getMovieDetailsFromTmdb({
      title: "Maria",
      year: "2024",
      directors: "Ian Velasco, Kerl Gian Encina",
    });
    const maria1Dir1 = await _getMovieDetailsFromTmdb({
      title: "Maria",
      year: "2024",
      directors: "Ian Velasco",
    });
    const maria1Dir2 = await _getMovieDetailsFromTmdb({
      title: "Maria",
      year: "2024",
      directors: "Kerl Gian Encina",
    });
    const maria2 = await _getMovieDetailsFromTmdb({
      title: "Maria",
      year: "2024",
      directors: "Jessica Palud",
    });
    const maria3 = await _getMovieDetailsFromTmdb({
      title: "Maria",
      year: "2024",
      directors: "Pablo Larraín",
    });

    expect(await maria1BothDirs).toMatchObject({
      movie: { id: 1260006 },
    });
    expect(await maria1Dir1).toMatchObject({ movie: { id: 1260006 } });
    expect(await maria1Dir2).toMatchObject({ movie: { id: 1260006 } });
    expect(await maria2).toMatchObject({ movie: { id: 971968 } });
    expect(await maria3).toMatchObject({ movie: { id: 1038263 } });
  });

  it("should work", async () => {
    expect(
      await _getMovieDetailsFromTmdb({
        title: "Frankenstein",
        year: "1931",
        directors: "James Whale",
      }),
    ).toEqual({
      wikipediaEnUrl: "https://en.wikipedia.org/wiki/Frankenstein_(1931_film)",
      wikipediaFrUrl: "https://fr.wikipedia.org/wiki/Frankenstein_(film,_1931)",
      image: {
        aspect_ratio: 1.778,
        file_path: "/wFbPbJ9uRDpjY7micBTeolgkOA4.jpg",
        height: 1080,
        iso_639_1: null,
        url: "https://image.tmdb.org/t/p/w780/wFbPbJ9uRDpjY7micBTeolgkOA4.jpg",
        width: 1920,
      },
      movie: {
        genres: ["Drame", "Horreur", "Science-Fiction"],
        id: 3035,
        original_language: "en",
        original_title: "Frankenstein",
        overview:
          "Le jeune savant Henry Frankenstein parvient, à partir de restes humains assemblés, à donner vie à une créature.",
        release_date: "1931-11-21",
        title: "Frankenstein",
      },
    });
  });
});
