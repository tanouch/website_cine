"use client";

import {capitalize, find, sortBy, uniqBy} from "lodash-es";
import {useSearchParams} from "next/navigation";
import {Fragment, useEffect, useMemo, useRef, useState} from "react";
import {useForm} from "react-hook-form";

import {format} from "date-fns";
import {fr} from "date-fns/locale";

import {Movie, SearchMovie} from "@/lib/types";
import {checkNotNull, floatHourToString, getNextMovieWeek} from "@/lib/util";

interface Inputs {
  mercredi: string;
  jeudi: string;
  vendredi: string;
  samedi: string;
  dimanche: string;
  lundi: string;
  mardi: string;
}

export default function SemaineAuCinema() {
  useSearchParams();

  const { register, watch } = useForm<Inputs>();
  const week = useMemo(() => getNextMovieWeek(), []);

  const [weekHtml, setWeekHtml] = useState("");

  const weekHtmlRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (weekHtml !== weekHtmlRef?.current?.innerHTML ?? "") {
      setWeekHtml(weekHtmlRef?.current?.innerHTML ?? "");
    }
  });

  const [moviesByDay, setMoviesByDay] = useState<Movie[][]>([]);
  const [movies, setMovies] = useState<SearchMovie[]>([]);
  useEffect(() => {
    (async () => {
      setMovies(await (await fetch("/api/all-movies")).json());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setMoviesByDay(
        await Promise.all(
          week.map(
            async (day) =>
              (await (
                await fetch(`/api/${format(day, "y-MM-dd")}`)
              ).json()) as Movie[],
          ),
        ),
      );
    })();
  }, [setMoviesByDay, week]);

  const days: Array<keyof Inputs> = week.map(
    (day) => format(day, "eeee", { locale: fr }) as keyof Inputs,
  );
  const dayValues = watch(days);
  const top_ints: number[] = Array.from(Array(5).keys());

  return (
    <>
      <h2>
        Votre Top5 2023 :
      </h2>
      <div style={{ textAlign: "center" }}>
        <form>
          {top_ints.map((day, i) => (
            <Fragment key={day}>
              <h3>{"Number " + capitalize(i+1)}</h3> <label htmlFor={day}></label>
              <select id={day} {...day}>
                [<option value="">-----</option>
                {sortBy(movies, (movie) => [movie.title]).map(
                  (movie) => (
                    <option value={movie.id} key={movie.id}>
                      {movie.title}, {movie.directors} ({movie.year})
                    </option>
                  ),
                )}
                ]
              </select>
            </Fragment>
          ))}
          <br />
          <br />
          <br />
        </form>
      </div>
        <h2>Semaine :</h2>
      <div ref={weekHtmlRef} style={{ textAlign: "center" }}>
        {getWeek(week, dayValues, moviesByDay)}
      </div>
      <h2>HTML :</h2>
      <span>{weekHtml}</span>
    </>
  );
}

function getWeek(week: Date[], dayValues: string[], moviesByDay: Movie[][]) {
  return (
    <>
      <h3
        style={{
          textAlign: "center",
          fontFamily: "lora,georgia,times new roman,serif",
          color: "#808080",
          fontSize: "18px",
        }}
      >
        UNE SEMAINE DE CINÉMA
      </h3>
      <br />
      <div
        style={{
          textAlign: "center",
          fontFamily: "lora,georgia,times new roman,serif",
          color: "#444444",
        }}
      >
        {week.map((day, i) => {
          if (dayValues[i] == null || dayValues[i] === "") {
            return null;
          } else {
            const movie = checkNotNull(
              find(moviesByDay[i], (movie) => movie.id === dayValues[i]),
            );
            const showtimes = sortBy(
              uniqBy(
                movie.showtimes_theater,
                (showtimes_theater) => showtimes_theater.clean_name,
              ),
              (showtimes_theater) => showtimes_theater.clean_name,
            );
            return (
              <Fragment key={i}>
                <strong>
                  <u>
                    <span style={{ fontSize: "18px" }}>
                      {capitalize(format(day, "EEEE d MMMM", { locale: fr }))}
                    </span>
                  </u>
                  <br />
                  <span style={{ fontSize: "16px" }}>
                    <i>{movie.title}</i>, {movie.directors} ({movie.year})
                  </span>
                </strong>
                <br />
                {showtimes.map((showtimes_theater) => (
                  <Fragment key={showtimes_theater.clean_name}>
                    {showtimes_theater.clean_name} (
                    {showtimes_theater.zipcode_clean}):{" "}
                    {showtimes_theater.showtimes
                      .map((showtime) => floatHourToString(showtime))
                      .join(", ")}
                    <br />
                  </Fragment>
                ))}
                <br />
              </Fragment>
            );
          }
        })}
      </div>
    </>
  );
}
