"use client";

import clsx from "clsx";
import { sortBy } from "lodash-es";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode, use, useEffect, useMemo } from "react";
import useSWR from "swr";

import { Loading, SuspenseWithLoading } from "@/components/icons/loading";
import MultiDaySeances from "@/components/seances/multiday-seances";
import Seances from "@/components/seances/seances";
import { CalendrierCopy, SousTitre2 } from "@/components/typography/typography";
import { Quartier, useCalendrierStore } from "@/lib/calendrier-store";
import {
  MovieWithScreeningsOneDay,
  MovieWithScreeningsSeveralDays,
} from "@/lib/types";
import {
  checkNotNull,
  fetcher,
  filterDates,
  filterNeighborhoods,
  filterTimes,
  formatYYYYMMDD,
  getRealMinHour,
  getStartOfTodayInParis,
  isCoupDeCoeur,
  isMovieWithShowtimesSeveralDays,
  isMoviesWithShowtimesSeveralDays,
  movieInfoContainsFilteringTerm,
} from "@/lib/util";

import coupDeCoeur from "../../assets/coup-de-coeur.png";

export default function MovieTable({
  serverMovies,
  allMovies = false,
  marseille,
}: {
  serverMovies: Promise<
    MovieWithScreeningsOneDay[] | MovieWithScreeningsSeveralDays[]
  >;
  allMovies?: boolean;
  marseille?: boolean;
}) {
  const date = useCalendrierStore((s) => s.date);
  const setDate = useCalendrierStore((s) => s.setDate);
  const useClientData = useCalendrierStore((s) => s.dateChanged);
  const minHour = useCalendrierStore((s) => s.minHour);
  const maxHour = useCalendrierStore((s) => s.maxHour);
  const filter = useCalendrierStore((s) => s.filter);
  const quartiers = useCalendrierStore((s) => s.quartiers);
  const events = useCalendrierStore((s) => s.events);

  const url = marseille
    ? allMovies
      ? `/api/movies/all-by-day-marseille/${formatYYYYMMDD(date)}`
      : `/api/movies/by-day-marseille/${formatYYYYMMDD(date)}`
    : allMovies
      ? `/api/movies/all-by-day/${formatYYYYMMDD(date)}`
      : `/api/movies/by-day/${formatYYYYMMDD(date)}`;

  const { data: clientMovies, isLoading } = useSWR<
    MovieWithScreeningsOneDay[] | MovieWithScreeningsSeveralDays[]
  >(useClientData ? url : false, fetcher);

  const minHourFilteringTodaysMissedFilms = useMemo(
    () => getRealMinHour(date, minHour),
    [minHour, date],
  );

  useEffect(() => {
    const keydown = (ev: KeyboardEvent) => {
      if (
        document?.activeElement?.tagName?.toLowerCase() === "input" ||
        document?.activeElement?.tagName?.toLowerCase() === "textarea"
      ) {
        return;
      }

      if (ev.key === "ArrowLeft") {
        const today = getStartOfTodayInParis();
        if (date > today) {
          setDate(date.minus({ days: 1 }));
        }
      } else if (ev.key === "ArrowRight") {
        setDate(date.plus({ days: 1 }));
      }
    };

    addEventListener("keydown", keydown);
    return () => removeEventListener("keydown", keydown);
  }, [date, setDate]);

  return (
    <div className="flex grow flex-col">
      <TableHeader />
      <SuspenseWithLoading className="h-60px border-b py-10px">
        {isLoading ? (
          <Loading className="h-60px border-b py-10px" />
        ) : (
          <LoadedTable
            {...{
              useClientData,
              serverMovies,
              clientMovies,
              minHourFilteringTodaysMissedFilms,
              maxHour,
              quartiers,
              filter,
              events,
            }}
            date={allMovies ? undefined : date}
          />
        )}
      </SuspenseWithLoading>
      <TableFooter />
    </div>
  );
}

function LoadedTable({
  serverMovies: serverMoviesPromise,
  clientMovies,
  useClientData,
  minHourFilteringTodaysMissedFilms,
  maxHour,
  quartiers,
  filter,
  events,
  date,
}: {
  serverMovies: Promise<
    MovieWithScreeningsOneDay[] | MovieWithScreeningsSeveralDays[]
  >;
  clientMovies?: MovieWithScreeningsOneDay[] | MovieWithScreeningsSeveralDays[];
  useClientData: boolean;
  minHourFilteringTodaysMissedFilms: number;
  maxHour: number;
  quartiers: Quartier[];
  filter: string;
  events: boolean;
  date?: DateTime;
}) {
  const serverMovies = use(serverMoviesPromise);
  const movies = useMemo(
    () => (useClientData ? checkNotNull(clientMovies) : serverMovies),
    [clientMovies, serverMovies, useClientData],
  );

  const sortedFilteredMovies = useMemo(
    () =>
      filterAndSortMovies(
        movies,
        minHourFilteringTodaysMissedFilms,
        maxHour,
        quartiers,
        filter,
        events,
      ),
    [
      movies,
      minHourFilteringTodaysMissedFilms,
      maxHour,
      quartiers,
      filter,
      events,
    ],
  );

  return sortedFilteredMovies.length == 0 ? (
    <EmptyTableState filter={filter} />
  ) : (
    <MovieRows date={date} movies={sortedFilteredMovies} />
  );
}

function TableHeader() {
  return (
    <Row
      cellClassName="bg-retro-green lg:px-20px border-t lg:py-17px p-6px"
      leftCol={<SousTitre2>Films</SousTitre2>}
      rightCol={<SousTitre2>Séances</SousTitre2>}
    />
  );
}

function EmptyTableState({ filter }: { filter: string }) {
  return (
    <div className="flex justify-center border-b py-13px lg:py-20px">
      <CalendrierCopy>
        {filter.length > 0
          ? "Aucun film ne correspond à cette recherche aujourd'hui. Essayez demain ?"
          : "Aucun film ne joue à cette heure-ci aujourd'hui. Essayez demain ?"}
      </CalendrierCopy>
    </div>
  );
}

function MovieRows({
  movies,
  date,
}: {
  movies: MovieWithScreeningsOneDay[] | MovieWithScreeningsSeveralDays[];
  date?: DateTime;
}) {
  return movies.map((movie) => (
    <Row
      key={movie.id}
      rowClassName="group"
      cellClassName="px-6px lg:px-10px group-odd:bg-retro-pale-green group-odd:lg:bg-white lg:group-hover:bg-retro-pale-green"
      leftCol={<MovieCell movie={movie} />}
      rightCol={
        <div className="py-12px lg:py-17px">
          {isMovieWithShowtimesSeveralDays(movie) ? (
            <MultiDaySeances
              title={movie.title}
              screenings={movie.showtimes_by_day}
              className="gap-y-10px"
            />
          ) : (
            <Seances
              day={checkNotNull(date?.toISODate())}
              title={movie.title}
              screenings={movie.showtimes_theater}
            />
          )}
        </div>
      }
    />
  ));
}

function TableFooter() {
  return (
    <div className="flex grow">
      <div className="min-h-100px w-1/2 border-r"></div>
    </div>
  );
}

function Row({
  leftCol,
  rightCol,
  cellClassName,
  rowClassName,
}: {
  leftCol?: ReactNode;
  rightCol?: ReactNode;
  cellClassName?: string;
  rowClassName?: string;
}) {
  return (
    <div className={clsx("flex", rowClassName)}>
      <div className="flex w-1/2 border-r">
        <div className={clsx("flex grow border-b", cellClassName)}>
          {leftCol}
        </div>
      </div>
      <div className="flex w-1/2">
        <div className={clsx("grow border-b", cellClassName)}>{rightCol}</div>
      </div>
    </div>
  );
}

function MovieCell({
  movie,
}: {
  movie: MovieWithScreeningsOneDay | MovieWithScreeningsSeveralDays;
}) {
  return (
    <Link href={`/film/${movie.id}`} className="block cursor-pointer">
      <div className="flex items-center">
        {isCoupDeCoeur(movie) && (
          <div className="shrink-0 pr-10px">
            <Image className="w-25px" alt="coup de coeur" src={coupDeCoeur} />
          </div>
        )}
        <div className="grow py-12px lg:py-17px">
          <CalendrierCopy>
            <i className="font-semibold uppercase group-hover:underline">
              {movie.title}
            </i>
            , {movie.directors} ({movie.year})
          </CalendrierCopy>
        </div>
      </div>
    </Link>
  );
}

function filterAndSortMovies(
  movies: MovieWithScreeningsOneDay[] | MovieWithScreeningsSeveralDays[],
  minHourFilteringTodaysMissedFilms: number,
  maxHour: number,
  quartiers: Quartier[],
  filter: string,
  events: boolean,
) {
  const moviesWithFilteredShowtimes = isMoviesWithShowtimesSeveralDays(movies)
    ? movies
        .map<MovieWithScreeningsSeveralDays>((movie) => ({
          ...movie,
          showtimes_by_day: Object.fromEntries(
            Object.entries(movie.showtimes_by_day)
              .map(([day, showtimes]) => [
                day,
                filterNeighborhoods(
                  filterTimes(showtimes, 0, 24, events),
                  quartiers,
                ),
              ])
              .filter(([_, showtimes]) => showtimes.length > 0),
          ),
        }))
        .map<MovieWithScreeningsSeveralDays>((movie) => ({
          ...movie,
          showtimes_by_day: filterDates(movie.showtimes_by_day),
        }))
        .filter((movie) =>
          Object.values(movie.showtimes_by_day).some(
            (showtimes) => showtimes.length > 0,
          ),
        )
    : movies
        .map<MovieWithScreeningsOneDay>((movie) => ({
          ...movie,
          showtimes_theater: filterNeighborhoods(
            filterTimes(
              movie.showtimes_theater,
              minHourFilteringTodaysMissedFilms,
              maxHour,
              events,
            ),
            quartiers,
          ),
        }))
        .filter((movie) => movie.showtimes_theater.length > 0);

  const filteredMovies = moviesWithFilteredShowtimes.filter(
    (movie) => filter == "" || movieInfoContainsFilteringTerm(movie, filter),
  );

  const sortedFilteredMovies = sortBy(filteredMovies, (movie) => [
    movie.year,
    movie.directors,
    movie.title,
  ]);

  return sortedFilteredMovies as
    | MovieWithScreeningsOneDay[]
    | MovieWithScreeningsSeveralDays[];
}
