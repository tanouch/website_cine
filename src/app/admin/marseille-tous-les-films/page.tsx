import { getDayMovies } from "@/lib/movies";
import { getStartOfTodayInParis } from "@/lib/util";
import MarseilleCalendrier from "@/app/admin/marseille/marseille";

export const dynamic = "force-dynamic";

export default function TousLesFilmsPageMarseille() {
  return (
    <MarseilleCalendrier
        title="Marseille - Tous les films"
        serverMovies={getDayMovies(getStartOfTodayInParis(), {
        collectionBase: "website-by-date-screenings-all-marseille",
        })}
        allMovies={true}
    />
  );
}
