"use client";

import { size } from "lodash-es";
import Link from "next/link";

import { TwoColumnPage } from "@/components/layout/page";
import PageHeader from "@/components/layout/page-header";
import MultiDaySeances from "@/components/seances/multiday-seances";
import { SectionTitle } from "@/components/typography/typography";
import { MovieDetail } from "@/lib/types";
import { filterDates } from "@/lib/util";

export default function DirectorView({
  movies,
  directorName,
}: {
  movies: MovieDetail[];
  directorName: string;
}) {
  return (
    <>
      <PageHeader text={directorName} />
      <TwoColumnPage
        narrow
        left={
          <div className="flex flex-col">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/film/${movie.id}`}
                className="border-b py-12px lg:py-16px lg:hover:bg-retro-pale-green"
              >
                <u>{movie.title}</u>, {movie.directors} ({movie.year})
              </Link>
            ))}
          </div>
        }
        right={
          <>
            <SectionTitle>Prochaines séances à Paris</SectionTitle>
            <div className="flex flex-col">
              {movies.map((movie) => {
                if (!movie?.screenings || !Object.keys(movie.screenings).length)
                  return null;

                try {
                  const screenings = filterDates(movie.screenings);
                  if (!screenings || !size(screenings)) return null;

                  return (
                    <div key={movie.id} className="border-b">
                      <div className="py-12px text-16px font-bold tracking-tight lg:text-20px">
                        {movie.title}
                      </div>
                      <MultiDaySeances
                        screenings={screenings}
                        groupClassName="py-8px lg:py-12px"
                      />
                    </div>
                  );
                } catch (error) {
                  return null;
                }
              })}
            </div>
          </>
        }
      />
    </>
  );
}
