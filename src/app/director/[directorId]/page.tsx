// [directorId]/page.tsx
import { Metadata } from "next";

import { getDirectorMovies } from "@/lib/directors";
import { getMovie } from "@/lib/movies";

import DirectorView from "./director";

export async function generateMetadata(props: {
  params: Promise<{ directorId: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const directorInfo = await getDirectorMovies(params.directorId);
  return {
    title: `Films by ${directorInfo.director_name}`,
    description: `Movies by ${directorInfo.director_name}`,
  };
}

export default async function DirectorPage(props: {
  params: Promise<{ directorId: string }>;
}) {
  const params = await props.params;
  const directorInfo = await getDirectorMovies(params.directorId);
  const movies = await Promise.all(
    directorInfo.director_movies.map((movieId) => getMovie(movieId)),
  );
  return (
    <DirectorView movies={movies} directorName={directorInfo.director_name} />
  );
}
