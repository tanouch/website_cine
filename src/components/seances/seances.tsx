"use client";

import clsx from "clsx";
import { sortBy, take, uniqBy } from "lodash-es";
import { useCallback, useMemo, useState } from "react";

import { ShowtimesTheater } from "@/lib/types";
import { floatHourToString, splitIntoSubArrays } from "@/lib/util";

import { CalendrierCopy } from "../typography/typography";

export default function Seances({
  showtimes_theater,
  timesPerLine,
}: {
  showtimes_theater: ShowtimesTheater[];
  timesPerLine?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(
    () => setIsExpanded(!isExpanded),
    [isExpanded, setIsExpanded],
  );

  const sortedTheaters = useMemo(
    () =>
      sortBy(
        uniqBy(showtimes_theater, (showtime_theater) => showtime_theater.name),
        (showtime_theater) => showtime_theater.name,
      ),
    [showtimes_theater],
  );

  const unexpandedTheaters = useMemo(
    () => take(sortedTheaters, 3),
    [sortedTheaters],
  );

  const needsExpanding = sortedTheaters.length !== unexpandedTheaters.length;

  return (
    <div
      onClick={toggleExpanded}
      className={clsx(
        { "cursor-pointer": needsExpanding },
        "flex grow flex-col gap-10px lg:gap-5px",
      )}
    >
      {(isExpanded ? sortedTheaters : unexpandedTheaters).map((theater) => (
        <SeancesTheater
          showtimesTheater={theater}
          key={theater.name}
          timesPerLine={timesPerLine}
        />
      ))}
      {needsExpanding && (
        <div className="flex justify-end">
          <CalendrierCopy className="font-semibold">
            {isExpanded ? "Moins de séances ↑" : "Plus de séances ↓"}
          </CalendrierCopy>
        </div>
      )}
    </div>
  );
}

function transformZipcode(inZip: string) {
  if (inZip.substring(0, 2) == "75") {
    inZip = inZip.substring(3, 5);
    if (inZip == "01") {
      return (
        <span>
          1<sup>er</sup>
        </span>
      );
    } else if (inZip.substring(0, 1) == "0") {
      inZip = inZip.substring(1, 2);
    }
    return (
      <span>
        {inZip}
        <sup>e</sup>
      </span>
    );
  } else {
    return <span>{inZip}</span>;
  }
}

export function SeancesTheater({
  showtimesTheater,
  timesPerLine,
}: {
  showtimesTheater: ShowtimesTheater;
  timesPerLine?: number;
}) {
  const lineGroups = splitIntoSubArrays(
    sortBy(showtimesTheater.showtimes),
    timesPerLine ?? 4,
  );

  return (
    <div
      className="group/theater flex justify-between"
      key={showtimesTheater.name}
    >
      <div className="pr-10px">
        <CalendrierCopy>
          {showtimesTheater.name} ({transformZipcode(showtimesTheater.zipcode)})
        </CalendrierCopy>
      </div>
      <div className="flex grow flex-col">
        {lineGroups.map((showtimes, i) => (
          <ShowtimesLine key={i} threeShowtimes={showtimes} />
        ))}
      </div>
    </div>
  );
}

function ShowtimesLine({ threeShowtimes }: { threeShowtimes: number[] }) {
  return (
    <div className="flex">
      <div className="mb-3px mr-10px grow border-dotted border-retro-black group-hover/theater:lg:border-b" />
      <div className="flex flex-col lg:flex-row lg:justify-end">
        {threeShowtimes.map((showtime) => (
          <div key={showtime} className="group/line flex justify-end">
            <CalendrierCopy>{floatHourToString(showtime)}</CalendrierCopy>
            <div className="hidden group-last/line:hidden lg:block">
              <CalendrierCopy>&nbsp;•&nbsp;</CalendrierCopy>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
