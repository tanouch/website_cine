// [directorId]/page.tsx
import { Metadata } from "next";

import { getDirectorMovies } from "@/lib/directors";
import { getMovie } from "@/lib/movies";

import DirectorView from "./director";

export async function generateMetadata({
  params: { directorId },
}: {
  params: { directorId: string };
}): Promise<Metadata> {
  const directorInfo = await getDirectorMovies(directorId);
  return {
    title: `Films by ${directorInfo.director_name}`,
    description: `Movies by ${directorInfo.director_name}`,
  };
}

export default async function DirectorPage({
  params: { directorId },
}: {
  params: { directorId: string };
}) {
  const directorInfo = await getDirectorMovies(directorId);
  const movies = await Promise.all(
    directorInfo.director_movies.map((movieId) => getMovie(movieId)),
  );
  return (
    <DirectorView movies={movies} directorName={directorInfo.director_name} />
  );
}
