import { size } from "lodash-es";
import Image from "next/image";
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

export default function Film({ movie }: { movie: MovieDetail }) {
  return (
    <>
      <PageHeader text={"Film"}>
        <MovieHeader movie={movie} />
      </PageHeader>
      <TwoColumnPage
        narrow
        left={
          <>
            <MovieReview movie={movie} />
            <MovieInformation movie={movie} />
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

function MovieReview({ movie }: { movie: MovieDetail }) {
  return (
    <>
      {movie.review && movie.review_date && (
        <div className="flex flex-col pb-20px">
          <div className="flex grow basis-0 pb-15px lg:pb-20px">
            <Image
              width={1200}
              height={675}
              className="h-auto w-full"
              src={getImageUrl(movie)}
              alt="movie-screenshot"
              {...blurProps}
            />
          </div>
          <BodyCopy className="border-b pb-20px lg:border-0 lg:pb-0">
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
                Texte du {formatDDMMYYWithSlashes(safeDate(movie.review_date))}
              </MetaCopy>
            </div>
          </BodyCopy>
        </div>
      )}
    </>
  );
}

function MovieInformation({ movie }: { movie: MovieDetail }) {
  return (
    <>
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
        </MetaCopy>
      </div>
    </>
  );
}

function MovieScreenings({ movie }: { movie: MovieDetail }) {
  let screenings = {};
  try {
    screenings = movie?.screenings ? filterDates(movie.screenings) : {};
    console.log("screenings after filter:", screenings);
  } catch (error) {
    console.error("Error in filterDates:", error);
  }

  return (
    <>
      <SectionTitle>Prochaines séances à Paris</SectionTitle>
      <div className="flex flex-col">
        {size(screenings) > 0 ? (
          <MultiDaySeances
            title={movie.title}
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
