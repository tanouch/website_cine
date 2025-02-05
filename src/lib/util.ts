import { every, mapValues, padStart, pickBy, some } from "lodash-es";
import { DateTime } from "luxon";
import Image from "next/image";
import { ComponentProps, useMemo } from "react";
import { useWindowSize } from "react-use";

import { Quartier } from "@/lib/calendrier-store";

import {
  MovieInfo,
  MovieWithScreeningsOneDay,
  MovieWithScreeningsSeveralDays,
  TheaterScreenings,
} from "./types";

export function isCoupDeCoeur({
  review_category,
}: {
  review_category?: string;
}) {
  return review_category === "COUP DE CŒUR";
}

export function getNextMovieWeek() {
  const today = nowInParis();
  const startOfNextWeek = today
    .startOf("week")
    .plus({ weeks: [1, 2, 3, 4, 5, 7].includes(today.weekday) ? 0 : 1 })
    .plus({ days: 2 });

  return [...Array(7)].map((_, i) => startOfNextWeek.plus({ days: i }));
}

export function checkNotNull<T>(check: T | null | undefined): T {
  if (check == null) {
    throw new Error();
  }
  return check;
}

export function floatHourToString(hour: number) {
  return `${Math.floor(hour)}h${padStart(
    parseInt((60 * (hour - Math.floor(hour))).toPrecision(2)).toString(),
    2,
    "0",
  )}`;
}

export function safeDate(date: string) {
  return DateTime.fromISO(date.replaceAll("_", "-"), {
    zone: "Europe/Paris",
    locale: "fr",
  });
}

export function nowInParis() {
  return DateTime.local({ zone: "Europe/Paris", locale: "fr" });
}

export function getStartOfTodayInParis() {
  return nowInParis().startOf("day");
}

export function cleanString(str: string) {
  return str
    .normalize("NFD")
    .replaceAll("&", " and ")
    .replaceAll("’", "'")
    .replaceAll("'", " ")
    .replaceAll(/[^a-zA-Z0-9 #]|[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function atLeastOneWordStartsWithSubstring(list: string[], substring: string) {
  return some(list, (word) => word.startsWith(substring));
}

export function stringMatch(term: string, searchField: string) {
  return stringMatchFields(getFields(term), getFields(searchField));
}

export function getFields(searchField: string) {
  return cleanString(searchField).split(" ");
}

export function stringMatchFields(keywords: string[], searchFields: string[]) {
  return every(keywords, (keyword) =>
    atLeastOneWordStartsWithSubstring(searchFields, keyword),
  );
}

export function movieInfoContainsFilteringTerm(
  movie: MovieInfo,
  filteringTerm: string,
) {
  if (filteringTerm.slice(-1) === "|") {
    filteringTerm = filteringTerm.slice(0, -1);
  }
  const filteringField = getMovieInfoString(movie);
  const filteringTerms = filteringTerm.split("|");
  return some(filteringTerms, (filteringTerm) =>
    stringMatch(filteringTerm, filteringField),
  );
}

export function getMovieInfoString(info: MovieInfo) {
  return (
    ["title", "original_title", "directors", "countries", "tags"] as Array<
      keyof MovieInfo
    >
  )
    .map((key) => {
      return info[key] == null ? "" : `${info[key]}`;
    })
    .join(" ");
}

// lundi 1 janvier
export function formatLundi1Janvier(date: DateTime) {
  return date.toFormat("EEEE d MMMM");
}

// 2024-12-31
export function formatYYYYMMDD(date: DateTime) {
  return date.toFormat("yyyy-MM-dd");
}

// 2024_12_31
export function formatYYYY_MM_DD(date: DateTime) {
  return date.toFormat("yyyy_MM_dd");
}

// 31/12/04
export function formatDDMMYYWithSlashes(date: DateTime) {
  return date.toFormat("dd/MM/yy");
}

// Ven. 31/12
export function formatMerJJMM(date: DateTime) {
  return date.toFormat("EEE dd/MM");
}

// lundi
export function formatLundi(date: DateTime) {
  return date.toFormat("EEEE");
}

export function useIsMobile() {
  const { width } = useWindowSize();
  return useMemo(() => width > 1 && width < 1024, [width]);
}

export const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export function getMovieTags({ tags }: { tags?: string }) {
  return Array.from((tags ?? "").matchAll(/#([^\s]+)/g)).map(([_, tag]) => tag);
}

export const TAG_MAP: Record<string, string> = {
  cdc: "coup de coeur",
  curio: "on est curieux",
  female: "femmes réalisatrices",
  jamesbond: "james bond",
  "s&s": "top 100 du sondage sight & sound",
};

export function getImageUrl({ id }: { id: string }) {
  return `https://firebasestorage.googleapis.com/v0/b/website-cine.appspot.com/o/images%2F${id}.jpg?alt=media`;
}

export const blurProps: Partial<ComponentProps<typeof Image>> = {
  placeholder: "blur",
  blurDataURL:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1I\
    w1AUhU9Ti6IVBTuIOGSoThZERRy1CkWoEGqFVh1MXvoHTRqSFBdHwbXg4M9i1cHFWVcHV0EQ/AFxdnBSdJES70sKLWK88Hgf591zeO8\
    +QKiXmWZ1jAOabpupRFzMZFfFzlcE0I8QehCSmWXMSVISvvV1T91UdzGe5d/3Z/WqOYsBAZF4lhmmTbxBPL1pG5z3iSOsKKvE58RjJl\
    2Q+JHrisdvnAsuCzwzYqZT88QRYrHQxkobs6KpEU8RR1VNp3wh47HKeYuzVq6y5j35C8M5fWWZ67SGkcAiliBBhIIqSijDRox2nRQLK\
    TqP+/iHXL9ELoVcJTByLKACDbLrB/+D37O18pMTXlI4DoReHOdjBOjcBRo1x/k+dpzGCRB8Bq70lr9SB2Y+Sa+1tOgR0LcNXFy3NGUP\
    uNwBBp8M2ZRdKUhLyOeB9zP6piwwcAt0r3lza57j9AFI06ySN8DBITBaoOx1n3d3tc/t357m/H4A00xyZ4zFmDgAAAAGYktHRAD/AP8\
    A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfoARAFFzB+KzuxAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU\
    1QV4EOFwAAAA1JREFUCNdj+PJ/+38ACT8DquQRMKUAAAAASUVORK5CYII=",
};

export function isMovieWithShowtimesSeveralDays(
  movie: MovieWithScreeningsOneDay | MovieWithScreeningsSeveralDays,
): movie is MovieWithScreeningsSeveralDays {
  return "showtimes_by_day" in movie;
}

export function isMoviesWithShowtimesSeveralDays(
  movies: MovieWithScreeningsOneDay[] | MovieWithScreeningsSeveralDays[],
): movies is MovieWithScreeningsSeveralDays[] {
  return some(movies, isMovieWithShowtimesSeveralDays);
}

export function getRealMinHour(date: DateTime, minHour: number) {
  if (!date.hasSame(nowInParis(), "day")) {
    return minHour;
  }
  const now = nowInParis();
  return Math.max(minHour, now.hour + now.minute / 60 - 0.3);
}

export function filterTimes(
  showtimes: TheaterScreenings[],
  minHour: number,
  maxHour: number,
  events?: boolean,
) {
  return showtimes
    .map((theater) => ({
      ...theater,
      seances: Object.fromEntries(
        Object.entries(theater.seances).filter(
          ([_, seance]) =>
            seance.time >= minHour &&
            seance.time <= maxHour &&
            (!events || seance.notes != null),
        ),
      ),
    }))
    .filter((theater) => Object.keys(theater.seances).length > 0);
}

export function filterNeighborhoods(
  showtimes: TheaterScreenings[],
  quartiers: Quartier[],
) {
  return showtimes.filter(
    (theater) =>
      Object.keys(theater.seances).length > 0 &&
      (quartiers.length === 0 ||
        some(quartiers, (quartier) => quartier === theater.neighborhood)),
  );
}

export function filterDates(showtimes: {
  [date: string]: TheaterScreenings[];
}) {
  return pickBy(
    mapValues(showtimes, (times, date) =>
      filterTimes(times, getRealMinHour(safeDate(date), 0), 24),
    ),
    (screenings, date) =>
      safeDate(date) >= getStartOfTodayInParis() && screenings.length > 0,
  );
}

export function staleWhileRevalidate<T>(
  fn: () => Promise<T>,
  { maxAgeMs }: { maxAgeMs: number },
) {
  let cache: { time: number; data?: Promise<T> } = { time: 0 };

  const refresh = async (now: number) => {
    const data = fn();
    cache = { time: now, data };
    return data;
  };

  return async () => {
    const now = new Date().getTime();
    if (cache.data == null) {
      return refresh(now);
    } else if (now - maxAgeMs > cache.time) {
      const data = cache.data;
      void refresh(now);
      return data;
    } else {
      return cache.data;
    }
  };
}
