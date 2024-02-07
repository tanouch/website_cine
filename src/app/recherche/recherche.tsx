"use client";

import clsx from "clsx";
import { every, orderBy, take, toPairs, without } from "lodash-es";
import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";

import RetroInput from "@/components/forms/retro-input";
import { SuspenseWithLoading } from "@/components/icons/loading";
import PageHeader, { FixedHeader } from "@/components/layout/page-header";
import { MetaCopy } from "@/components/typography/typography";
import { SearchMovie } from "@/lib/types";
import { TAG_MAP, string_match } from "@/lib/util";

const useRechercheStore = create<{
  tags: string[];
}>()(() => ({
  tags: Object.keys(TAG_MAP),
}));

const toggleTag = (tag: string) =>
  useRechercheStore.setState((s) => ({
    tags: s.tags.includes(tag) ? without(s.tags, tag) : [...s.tags, tag],
  }));

export default function Recherche({
  allMoviesPromise,
}: {
  allMoviesPromise: Promise<SearchMovie[]>;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const [selected, setSelected] = useState<number | undefined>(undefined);

  const onChangeSearchTerm = useCallback(
    (s: string) => {
      setSelected(undefined);
      setSearchTerm(s);
    },
    [setSelected, setSearchTerm],
  );

  return (
    <>
      <FixedHeader disableBelowPadding className="lg:border-b lg:pb-20px">
        <div className="lg:hidden">
          <PageHeader text={"recherche"} />
        </div>
        <div className="flex flex-col lg:pl-20px">
          <RetroInput
            customTypography
            value={searchTerm}
            setValue={onChangeSearchTerm}
            placeholder="film, réalisateur, année, pays..."
            leftAlignPlaceholder
            transparentPlaceholder
            grayText
            customHeight
            className="h-50px text-21px font-medium uppercase lg:h-57px lg:text-29px lg:tracking-[-0.01em]"
          />
        </div>
      </FixedHeader>
      <div className="flex grow flex-col lg:py-0 lg:pl-20px">
        <div className="flex hidden flex-wrap gap-10px py-10px lg:gap-x-20px lg:gap-y-16px lg:py-20px">
          {toPairs(TAG_MAP).map(([tag, displayTag]) => (
            <Tag key={tag} {...{ tag, displayTag }} />
          ))}
        </div>
        {searchTerm.length > 0 ? (
          <SuspenseWithLoading className="flex grow items-center justify-center pt-15px">
            <Results
              {...{ searchTerm, allMoviesPromise, selected, setSelected }}
            />
          </SuspenseWithLoading>
        ) : (
          <Results
            {...{ searchTerm, allMoviesPromise, selected, setSelected }}
          />
        )}
      </div>
    </>
  );
}

function Results({
  allMoviesPromise,
  searchTerm,
  setSelected,
  selected,
}: {
  allMoviesPromise: Promise<SearchMovie[]>;
  searchTerm: string;
  setSelected: (i: number | undefined) => void;
  selected: number | undefined;
}) {
  const tags = useRechercheStore((s) => s.tags);
  const allMovies = use(allMoviesPromise);
  const filtered = useMemo(
    () =>
      searchTerm.length > 0
        ? take(
            orderBy(
              allMovies.filter(
                (movie) =>
                  string_match(
                    searchTerm,
                    `${movie.directors} ${movie.title} ${movie.original_title}`,
                  ) &&
                  (tags.length === 0 || every(tags, () => true)),
              ),
              (movie) => movie.relevance_score,
              "desc",
            ),
            50,
          )
        : [],
    [allMovies, searchTerm, tags],
  );

  useEffect(() => {
    const keydown = (ev: KeyboardEvent) => {
      if (ev.key === "ArrowDown") {
        setSelected(Math.min((selected ?? 0) + 1, filtered.length - 1));
      } else if (ev.key === "ArrowUp") {
        setSelected(Math.max((selected ?? 0) - 1, 0));
      } else if (ev.key === "Enter") {
        // select;
      }
    };

    addEventListener("keydown", keydown);
    return () => removeEventListener("keydown", keydown);
  }, [setSelected, selected, filtered]);

  return (
    searchTerm.length > 0 && (
      <div className="flex grow flex-col">
        {filtered.length > 0 ? (
          filtered.map((movie, i) => (
            <Link
              key={movie.id}
              href={`/film/${movie.id}`}
              className={clsx(
                {
                  "lg:bg-retro-pale-green, lg:odd:bg-retro-pale-green":
                    i === selected,
                },
                "border-b py-10px pl-5px text-15px font-medium uppercase leading-20px even:bg-retro-pale-green lg:py-18px lg:pl-10px lg:text-18px lg:leading-21px lg:tracking-[0.01em] lg:first:border-t-0 lg:even:bg-white lg:hover:bg-retro-pale-green",
              )}
            >
              <u>{movie.title}</u>, {movie.directors} ({movie.year})
            </Link>
          ))
        ) : (
          <div className="pt-15px lg:pt-20px">
            <MetaCopy>
              Désolé, nous n&apos;avons rien trouvé qui corresponde à votre
              recherche !
            </MetaCopy>
          </div>
        )}
      </div>
    )
  );
}

function Tag({ tag, displayTag }: { tag: string; displayTag: string }) {
  const onClick = useCallback(() => toggleTag(tag), [tag]);
  const enabled = useRechercheStore((s) => s.tags.includes(tag));
  return (
    <div
      onClick={onClick}
      className={clsx(
        { "line-through": !enabled },
        "cursor-pointer rounded-2xl bg-retro-gray px-12px py-6px text-19px font-medium uppercase leading-20px text-white lg:px-12px lg:text-20px lg:tracking-[-0.02em]",
      )}
    >
      {displayTag}
    </div>
  );
}
