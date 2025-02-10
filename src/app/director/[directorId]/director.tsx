"use client";

import { size } from "lodash-es";
import Link from "next/link";
import React, { ReactNode } from "react";

import { TwoColumnPage } from "@/components/layout/page";
import PageHeader from "@/components/layout/page-header";
import MultiDaySeances from "@/components/seances/multiday-seances";
import {
  SectionTitle,
  SousTitre1,
  SubsectionTitle,
} from "@/components/typography/typography";
import { MovieDetail, TheaterScreenings } from "@/lib/types";
import { filterDates } from "@/lib/util";

const formatDate = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split("_").map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
      .format(date)
      .toUpperCase();
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
};

export default function DirectorView({
  movies,
  directorName,
}: {
  movies: MovieDetail[];
  directorName: string;
}) {
  const sortedMovies = [...movies].sort(
    (a, b) => (Number(a.year) || 0) - (Number(b.year) || 0),
  );

  return (
    <>
      <PageHeader text={"Cinéaste"}>
        <SousTitre1>{directorName}</SousTitre1>
      </PageHeader>
      <TwoColumnPage
        narrow
        left={
          (
            <div className="flex flex-col">
              <SectionTitle color="bg-retro-pale-green">
                Filmographie
              </SectionTitle>
              <div>
                {sortedMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/film/${movie.id}`}
                    className="block border-b py-12px font-semibold lg:py-16px lg:hover:bg-retro-pale-green"
                  >
                    <div>
                      <u className="uppercase">{movie.title}</u> ({movie.year})
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) as ReactNode
        }
        right={
          (
            <>
              <SectionTitle>Prochaines séances à Paris</SectionTitle>
              <div className="flex flex-col">
                {Object.entries(
                  movies.reduce(
                    (acc, movie) => {
                      if (
                        !movie?.screenings ||
                        !Object.keys(movie.screenings).length
                      )
                        return acc;

                      try {
                        const screenings = filterDates(movie.screenings);
                        if (!screenings || !size(screenings)) return acc;

                        Object.entries(screenings).forEach(([date, times]) => {
                          if (!acc[date]) acc[date] = [];

                          if (Array.isArray(times)) {
                            const theaterScreenings: TheaterScreenings[] =
                              times.map((theater) => ({
                                name: theater.name || "",
                                neighborhood: theater.neighborhood || "",
                                zipcode: theater.zipcode || "",
                                preposition_and_name:
                                  theater.preposition_and_name || "",
                                seances: theater.seances || {},
                              }));

                            acc[date].push({
                              ...movie,
                              theaters: theaterScreenings,
                            });
                          }
                        });
                        return acc;
                      } catch (error) {
                        console.error("Error processing screenings:", error);
                        return acc;
                      }
                    },
                    {} as Record<
                      string,
                      Array<MovieDetail & { theaters: TheaterScreenings[] }>
                    >,
                  ),
                )
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([date, moviesForDay]) => (
                    <div key={date}>
                      <SubsectionTitle align="text-left">
                        <span className="uppercase">{formatDate(date)}</span>
                      </SubsectionTitle>
                      <div className="space-y-2">
                        {moviesForDay.map((movie) => (
                          <div
                            key={`${date}-${movie.id}`}
                            className="flex items-center justify-between border-b py-2"
                          >
                            <div className="uppercase italic">
                              {movie.title}
                            </div>
                            <MultiDaySeances
                              screenings={{ [date]: movie.theaters }}
                              groupClassName="flex items-center gap-4"
                              theaterAlign={"text-right"}
                              hideDate={true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) as ReactNode
        }
      />
    </>
  );
}
