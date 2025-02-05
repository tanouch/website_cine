"use server";

import { filter, flow, map, take } from "lodash-es";

import { getSearchMovies } from "@/lib/movies";
import { getFields, stringMatchFields } from "@/lib/util";

export async function search({
  searchTerm,
  nbResults,
}: {
  searchTerm: string;
  nbResults: number;
}) {
  const searchMovies = await getSearchMovies();
  const keywords = getFields(searchTerm);

  return searchTerm.length > 0
    ? flow(
        (sm) =>
          filter(sm, ([_, fields]) => stringMatchFields(keywords, fields)),
        (sm) => map(sm, ([elem]) => elem),
        (sm) => take(sm, nbResults),
      )(searchMovies)
    : [];
}
