import { size } from "lodash-es";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

import coupDeCoeur from "@/assets/coup-de-coeur.png";
import { TwoColumnPage } from "@/components/layout/page";
import PageHeader from "@/components/layout/page-header";
import MultiDaySeances from "@/components/seances/multiday-seances";
import {
  BodyCopy,
  MetaCopy,
  SectionTitle,
  SousTitre1,
} from "@/components/typography/typography";
import { Button } from "@/components/ui/button";
import { TmdbMovie } from "@/lib/tmdb";
import { MovieDetail } from "@/lib/types";
import {
  TAG_MAP,
  blurProps,
  filterDates,
  formatDDMMYYWithSlashes,
  getImageUrl,
  getMovieTags,
  safeDate,
} from "@/lib/util";

export default function Film({
  movie,
  tmdbMovie,
}: {
  movie: MovieDetail;
  tmdbMovie?: TmdbMovie;
}) {
  return (
    <>
      <PageHeader text={"Film"}>
        <MovieHeader movie={movie} />
      </PageHeader>
      <TwoColumnPage
        narrow
        left={
          <>
            <MovieReview movie={movie} tmdbMovie={tmdbMovie} />
            <MovieInformation movie={movie} tmdbMovie={tmdbMovie} />
          </>
        }
        right={
          <>
            <MovieScreenings movie={movie} />
            <Tags movie={movie} />
          </>
        }
      />
    </>
  );
}

function MovieHeader({ movie }: { movie: MovieDetail }) {
  return (
    <SousTitre1>
      <u>{movie.title}</u>, {movie.directors} ({movie.year})
    </SousTitre1>
  );
}

function MovieReview({
  movie,
  tmdbMovie,
}: {
  movie: MovieDetail;
  tmdbMovie?: TmdbMovie;
}) {
  const tmdbImage = tmdbMovie?.image;
  return (
    <>
      {(movie.review != null && movie.review_date != null) ||
      tmdbImage != null ? (
        <div className="flex flex-col pb-20px">
          <div className="flex grow basis-0">
            {movie.review != null && movie.review_date != null ? (
              <Image
                width={1200}
                height={675}
                className="h-auto w-full"
                src={getImageUrl(movie)}
                alt="movie-screenshot"
                {...blurProps}
              />
            ) : tmdbImage != null ? (
              <Image
                unoptimized
                alt="movie-screenshot"
                width={tmdbImage.width}
                height={tmdbImage.height}
                src={tmdbImage.url}
              />
            ) : null}
          </div>
          {movie.review_category == "COUP DE CŒUR" &&
          movie.review != null &&
          movie.review_date != null ? (
            <BodyCopy className="border-b pb-20px pt-15px lg:border-0 lg:pb-0 lg:pt-20px">
              <div dangerouslySetInnerHTML={{ __html: movie.review }}></div>
              <br />
              <div className="flex items-center pt-6px">
                <div className="pr-6px">
                  <Image
                    className="w-25px"
                    alt="coup de coeur"
                    src={coupDeCoeur}
                  />
                </div>
                <MetaCopy>
                  Texte du{" "}
                  {formatDDMMYYWithSlashes(safeDate(movie.review_date))}
                </MetaCopy>
              </div>
            </BodyCopy>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function MovieInformation({
  movie,
  tmdbMovie,
}: {
  movie: MovieDetail;
  tmdbMovie?: TmdbMovie;
}) {
  return (
    <>
      <div className="flex flex-col gap-20px pb-20px">
        <div className="flex pb-20px lg:border-y lg:py-20px">
          <MetaCopy lowercase>
            {movie.duration == null ? (
              "Durée inconnue"
            ) : (
              <div>
                DURÉE&nbsp;: {Math.floor(parseInt(movie.duration) / 60)} minutes
              </div>
            )}
            {movie.language != null &&
              movie.language != "-" &&
              (movie.language == "Silencieux" || movie.language == "Muet" ? (
                <div>Film muet</div>
              ) : (
                <div>LANGUE&nbsp;: {movie.language}</div>
              ))}
            <br />
            {movie.original_title != null &&
              movie.original_title != movie.title && (
                <div>
                  TITRE ORIGINAL&nbsp;:{" "}
                  <i className={"uppercase"}>{movie.original_title}</i>
                </div>
              )}
            {movie.countries != null &&
              movie.countries != "inconnue" &&
              (movie.countries == "U.S.A." ? (
                <div>PAYS&nbsp;: États-Unis</div>
              ) : (
                <div>PAYS&nbsp;: {movie.countries}</div>
              ))}
            {movie.distributor != null && (
              <div>DISTRIBUTION&nbsp;: {movie.distributor}</div>
            )}
            {tmdbMovie?.movie.genres != null ? (
              <div>
                GENRE{tmdbMovie.movie.genres.length > 1 ? "S" : ""}&nbsp;:{" "}
                {tmdbMovie?.movie.genres.join(", ")}
              </div>
            ) : null}
          </MetaCopy>
        </div>
        {tmdbMovie != null ? (
          <div className="flex flex-col gap-20px">
            {movie.review_category !== "COUP DE CŒUR" ||
            movie.review == null ||
            movie.review_date == null ? (
              <div className="flex flex-col border-b pb-10px">
                <BodyCopy className="text-retro-gray">
                  {tmdbMovie.movie.overview}
                </BodyCopy>{" "}
                <BodyCopy className="text-right text-10px italic text-retro-gray lg:text-12px">
                  (source:{" "}
                  <Link
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    className="hover:underline"
                  >
                    TMDB
                  </Link>
                  )
                </BodyCopy>
              </div>
            ) : null}
            <div className="grid grid-cols-fillMin300 gap-x-8px gap-y-10px">
              <div className="grid grid-cols-fillMinHalf gap-x-8px gap-y-10px">
                <Button variant="outline" asChild>
                  <Link
                    target="_blank"
                    href={`https://www.themoviedb.org/movie/${tmdbMovie.movie.id}`}
                  >
                    TMDB
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link
                    target="_blank"
                    href={`https://letterboxd.com/tmdb/${tmdbMovie.movie.id}`}
                  >
                    letterboxd
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-fillMinHalf gap-x-8px gap-y-10px">
                {tmdbMovie.wikipediaFrUrl != null ? (
                  <Button variant="outline" asChild>
                    <Link target="_blank" href={tmdbMovie.wikipediaFrUrl}>
                      Wikipedia
                    </Link>
                  </Button>
                ) : null}
                {tmdbMovie.wikipediaEnUrl != null ? (
                  <Button variant="outline" asChild>
                    <Link target="_blank" href={tmdbMovie.wikipediaEnUrl}>
                      Wikipedia (EN)
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>{" "}
          </div>
        ) : null}
      </div>
    </>
  );
}

function MovieScreenings({ movie }: { movie: MovieDetail }) {
  let screenings = {};
  try {
    screenings = movie?.screenings ? filterDates(movie.screenings) : {};
  } catch (error) {
    console.error("Error in filterDates:", error);
  }

  return (
    <>
      <SectionTitle>Prochaines séances à Paris</SectionTitle>
      <div className="flex flex-col">
        {size(screenings) > 0 ? (
          <MultiDaySeances
            screenings={screenings}
            groupClassName="border-b py-12px lg:py-16px lg:hover:bg-retro-pale-green"
          />
        ) : (
          <div className="border-b py-12px text-center lg:grow lg:py-16px">
            <BodyCopy>Pas de séances prévues pour le moment</BodyCopy>
          </div>
        )}
      </div>
    </>
  );
}

function Tags({ movie }: { movie: MovieDetail }) {
  const tags = useMemo(() => getMovieTags(movie), [movie]);

  return (
    tags.length > 0 && (
      <div className="flex hidden flex-wrap gap-8px pt-15px lg:gap-10px lg:pt-20px">
        {tags.map((tag) => (
          <div
            key={tag}
            className="rounded-2xl bg-retro-gray px-15px py-6px text-19px font-medium uppercase text-white lg:px-12px lg:text-20px lg:tracking-[-0.02em]"
          >
            {TAG_MAP[tag]}
          </div>
        ))}
      </div>
    )
  );
}
