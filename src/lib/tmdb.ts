import { filter, memoize, omit } from "lodash";
import { unstable_cache } from "next/cache";
import { z } from "zod";

import { checkNotNull } from "./util";
import { getWikipediaUrls } from "./wikimedia";

export type TmdbMovie = Awaited<ReturnType<typeof getMovieDetailsFromTmdb>>;

type QueryInput = {
  title: string;
  originalTitle?: string;
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
      popularity: z.number(),
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
    url: `${config.images.secure_base_url}/${backdropSize}/${image.file_path}`,
  };
}

export const getMovieDetailsFromTmdb = unstable_cache(
  async ({ title, originalTitle, year }: QueryInput) => {
    try {
      const genresPromise = getGenres();
      const configuration = getConfiguration();

      const movie = searchResponseSchema
        .parse(
          await tmdbRequest(SEARCH_MOVIES_PATH, {
            year,
            language: "fr-FR",
            query: `${originalTitle ?? title}`,
          }),
        )
        .results.at(0);

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
  },
  ["tmdb"],
  { revalidate: 60 },
);
