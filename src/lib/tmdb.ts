import { distance } from "fastest-levenshtein";
import { filter, memoize, min, omit, sortBy } from "lodash-es";
import { unstable_cache } from "next/cache";
import { z } from "zod";

import { checkNotNull } from "./util";
import { getWikipediaUrls } from "./wikimedia";

export type TmdbMovie = Awaited<ReturnType<typeof getMovieDetailsFromTmdb>>;

const MAXIMUM_TITLE_DISTANCE = 5;
const MAXIMUM_TOTAL_DISTANCE = 8;

type QueryInput = {
  title: string;
  originalTitle?: string;
  directors: string;
  year: string;
};

const searchResponseSchema = z.object({
  results: z.array(
    z.object({
      genre_ids: z.array(z.number()),
      id: z.number(),
      original_language: z.string(),
      original_title: z.string(),
      overview: z.string(),
      release_date: z.string().date(),
      title: z.string(),
    }),
  ),
});

const genresResponseSchema = z.object({
  genres: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
});

const imagesResponseSchema = z.object({
  backdrops: z.array(
    z.object({
      aspect_ratio: z.number(),
      iso_639_1: z.string().nullable(),
      height: z.number(),
      file_path: z.string(),
      width: z.number(),
    }),
  ),
  logos: z.array(
    z.object({
      aspect_ratio: z.number(),
      height: z.number(),
      file_path: z.string(),
      width: z.number(),
    }),
  ),
  posters: z.array(
    z.object({
      aspect_ratio: z.number(),
      height: z.number(),
      file_path: z.string(),
      width: z.number(),
    }),
  ),
});

const configurationSchema = z.object({
  images: z.object({
    backdrop_sizes: z.array(z.string()),
    secure_base_url: z.string(),
  }),
});

const externalIdsSchema = z.object({
  wikidata_id: z.string().nullable(),
});

const creditsSchema = z.object({
  crew: z.array(
    z.object({
      name: z.string(),
      job: z.string(),
    }),
  ),
});

const TMDB_API_KEY = () => checkNotNull(process.env.TMDB_API_KEY);
const TMDB_BASE = "https://api.themoviedb.org/3";
const CONFIGURATION_PATH = "/configuration";
const SEARCH_MOVIES_PATH = "/search/movie";
const GENRES_LIST_PATH = "/genre/movie/list";

function getMovieImagesPath({ movieId }: { movieId: number }) {
  return `/movie/${movieId}/images`;
}

function getMovieExternalIdsPath({ movieId }: { movieId: number }) {
  return `/movie/${movieId}/external_ids`;
}

function getMovieCreditsPath({ movieId }: { movieId: number }) {
  return `/movie/${movieId}/credits`;
}

async function tmdbRequest(
  path: string,
  params: Record<string, string | number> = {},
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    query.set(key, `${value}`);
  });
  query.set("api_key", TMDB_API_KEY());

  const url = new URL(`${TMDB_BASE}${path}`);
  url.search = query.toString();

  const response = await fetch(url);
  return response.json();
}

const getGenres = memoize(async () => {
  const response = await tmdbRequest(GENRES_LIST_PATH, { language: "fr-FR" });
  return genresResponseSchema.parse(response);
});

async function getMovieImages({ movieId }: { movieId: number }) {
  const response = await tmdbRequest(getMovieImagesPath({ movieId }));
  return imagesResponseSchema.parse(response);
}

async function getExternalIds({ movieId }: { movieId: number }) {
  const response = await tmdbRequest(getMovieExternalIdsPath({ movieId }));
  return externalIdsSchema.parse(response);
}

async function searchMovie({ title, year }: { title: string; year: string }) {
  const response = await tmdbRequest(SEARCH_MOVIES_PATH, {
    year,
    language: "fr-FR",
    query: title,
  });

  return searchResponseSchema.parse(response);
}

async function getMovieCredits({ movieId }: { movieId: number }) {
  const response = await tmdbRequest(getMovieCreditsPath({ movieId }));

  return creditsSchema.parse(response);
}

const getConfiguration = memoize(async () => {
  const response = await tmdbRequest(CONFIGURATION_PATH);
  return configurationSchema.parse(response);
});

function getAsImageWithUrl(
  image: z.infer<typeof imagesResponseSchema>["backdrops"][number],
  config: z.infer<typeof configurationSchema>,
) {
  const backdropSize = config.images.backdrop_sizes.filter(
    (size) => Number((size.match(/\d+/) ?? ["-1"])[0]) > 640,
  )[0];
  return {
    ...omit(image, "path"),
    url: `${config.images.secure_base_url}${backdropSize}${image.file_path}`,
  };
}

type SearchMovie = z.infer<typeof searchResponseSchema>["results"][number];

type MovieWithCredits = [SearchMovie, z.infer<typeof creditsSchema>];

function getLikeliestMovie({
  title,
  originalTitle,
  directors: _directors,
  year,
  movies,
}: QueryInput & {
  movies: MovieWithCredits[];
}) {
  const inputDirectors = _directors.split(", ");

  const moviesSortedByScore = sortBy(
    movies.map<[SearchMovie, number]>(([movie, credits]) => {
      const directorPairs = inputDirectors.flatMap((inputDirector) =>
        credits.crew
          .filter((c) => c.job === "Director")
          .map<[string, string]>((c) => [inputDirector, c.name]),
      );
      const directorScore =
        min(directorPairs.map(([a, b]) => distance(a, b))) ?? 0;
      const titleScore = distance(title, movie.title);
      const originalTitleScore =
        originalTitle != null
          ? distance(originalTitle, movie.original_title)
          : 0;
      const yearScore = Math.abs(
        Number(year) - Number(movie.release_date.slice(0, 4)),
      );

      return [
        movie,
        directorScore + titleScore + originalTitleScore + yearScore,
      ];
    }),
    ([_, score]) => score,
  );

  const [movie, score] = moviesSortedByScore[0];

  if (score >= MAXIMUM_TOTAL_DISTANCE) {
    return undefined;
  }

  return movie;
}

export async function _getMovieDetailsFromTmdb({
  title,
  originalTitle,
  directors,
  year,
}: QueryInput) {
  try {
    const genresPromise = getGenres();
    const configuration = getConfiguration();

    const movie = await (async function searchAndPickClosestMatch() {
      const searchResults = (await searchMovie({ title, year })).results;
      const moviesWithCredits = await Promise.all(
        searchResults
          .filter((movie) => distance(movie.title, title) < 5)
          .map<Promise<MovieWithCredits>>(async (movie) => [
            movie,
            await getMovieCredits({ movieId: movie.id }),
          ]),
      );

      if (moviesWithCredits.length === 0) {
        return undefined;
      }

      return getLikeliestMovie({
        movies: moviesWithCredits,
        title,
        year,
        originalTitle,
        directors,
      });
    })();

    if (movie == null) {
      return undefined;
    }

    const image = await (async function getImage() {
      const images = await getMovieImages({ movieId: movie.id });

      const isWide169BackdropWithNoText = ({
        width,
        aspect_ratio,
        iso_639_1,
      }: z.infer<typeof imagesResponseSchema>["backdrops"][number]) =>
        width > 640 && 16 / 9 - aspect_ratio < 0.01 && iso_639_1 == null;

      const bestImage =
        filter(images.backdrops, isWide169BackdropWithNoText).at(0) ??
        images.backdrops.at(0);

      if (bestImage == null) {
        return undefined;
      }

      return getAsImageWithUrl(bestImage, await configuration);
    })();

    const { wikipediaFrUrl, wikipediaEnUrl } =
      await (async function _getWikipediaUrls() {
        const { wikidata_id } = await getExternalIds({ movieId: movie.id });
        if (wikidata_id == null) {
          return { wikipediaFrUrl: undefined, wikipediaEnUrl: undefined };
        }

        const wikipediaUrls = await getWikipediaUrls({
          wikidataId: wikidata_id,
        });

        return {
          wikipediaFrUrl: wikipediaUrls?.frwiki?.url,
          wikipediaEnUrl: wikipediaUrls?.enwiki?.url,
        };
      })();

    const genres = await genresPromise;
    const movieWithGenreNames = {
      ...omit(movie, "genre_ids"),
      genres: movie.genre_ids.map(
        (id) => checkNotNull(genres.genres.find((g) => g.id === id)).name,
      ),
    };

    return {
      movie: movieWithGenreNames,
      image,
      wikipediaEnUrl,
      wikipediaFrUrl,
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export const getMovieDetailsFromTmdb = unstable_cache(
  _getMovieDetailsFromTmdb,
  ["tmdb"],
  { revalidate: 60 },
);
