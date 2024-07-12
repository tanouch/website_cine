"use client";

import clsx from "clsx";
import { sortBy, take, uniqBy } from "lodash-es";
import { useCallback, useMemo, useState } from "react";

import { ShowtimesTheater } from "@/lib/types";
import { floatHourToString } from "@/lib/util";

import { CalendrierCopy } from "../typography/typography";

export default function Seances({
  showtimes_theater,
}: {
  showtimes_theater: ShowtimesTheater[];
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
    <div className={clsx("flex grow flex-col gap-10px lg:gap-5px")}>
      {(isExpanded ? sortedTheaters : unexpandedTheaters).map((theater) => (
        <SeancesTheater
          showtimesTheater={theater}
          key={theater.name}
          isExpanded={isExpanded}
        />
      ))}
      {needsExpanding && (
        <div
          className={clsx("flex justify-end", {
            "cursor-pointer": needsExpanding,
          })}
          onClick={toggleExpanded}
        >
          <CalendrierCopy className="font-semibold">
            {isExpanded ? "Moins de séances ↑" : "Plus de séances ↓"}
          </CalendrierCopy>
        </div>
      )}
    </div>
  );
}

export function transformZipcode(inZip: string) {
  if (inZip.substring(0, 2) == "75") {
    inZip = inZip.substring(3, 5);
    if (inZip == "01") {
      return (
        <span>
          1<sup style={{ lineHeight: 0 }}>er</sup>
        </span>
      );
    } else if (inZip.substring(0, 1) == "0") {
      inZip = inZip.substring(1, 2);
    }
    return (
      <span>
        {inZip}
        <sup style={{ lineHeight: 0 }}>e</sup>
      </span>
    );
  } else {
    return <span>{inZip}</span>;
  }
}

export function SeancesTheater({
  showtimesTheater,
  isExpanded,
}: {
  showtimesTheater: ShowtimesTheater;
  isExpanded: boolean;
}) {
  return (
    <div>
      <div
        className="group/cinema flex items-start justify-between"
        key={showtimesTheater.name}
      >
        <div className="w-min grow pr-10px lg:pr-30px">
          <CalendrierCopy
            className={clsx({ "group-hover/cinema:underline": isExpanded })}
          >
            {showtimesTheater.name} (
            {transformZipcode(showtimesTheater.zipcode)})
          </CalendrierCopy>
        </div>
        <div className="flex flex-col justify-end lg:flex-row lg:flex-wrap lg:self-start">
          {showtimesTheater.screenings.map((screening) => (
            <div
              key={screening.time}
              className={clsx("group/seances flex justify-end", {
                "group-hover/cinema:underline": isExpanded,
              })}
            >
              <CalendrierCopy>
                {floatHourToString(screening.time)}
                {screening.notes != null && (
                  <span className="text-retro-gray"> {screening.notes}</span>
                )}
              </CalendrierCopy>
              <div className="hidden group-last/seances:hidden lg:block">
                <CalendrierCopy>&nbsp;•&nbsp;</CalendrierCopy>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
