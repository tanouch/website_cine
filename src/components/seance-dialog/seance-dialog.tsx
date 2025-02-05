"use client";

import {
  CalendarEvent,
  google,
  ics,
  office365,
  outlook,
  yahoo,
} from "calendar-link";
import { DateTime } from "luxon";
import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

import { checkNotNull } from "@/lib/util";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export type DialogSeance = {
  movieTitle: string;
  movieDate: DateTime;
  movieTheater: string;
};

type DialogStore = {
  seance?: DialogSeance;
  setSeance: (seance: DialogSeance) => void;
  clearSeance: () => void;
};

const StoreContext = createContext<StoreApi<DialogStore> | undefined>(
  undefined,
);

function createDialogStore() {
  return createStore<DialogStore>()(
    immer((set) => {
      return {
        setSeance: (seance: DialogSeance) =>
          set((s) => {
            s.seance = seance;
          }),
        clearSeance: () =>
          set((s) => {
            s.seance = undefined;
          }),
      };
    }),
  );
}

export function SeanceDialogStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(createDialogStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useSeanceDialogStore<T>(selector: (s: DialogStore) => T): T {
  const store = checkNotNull(useContext(StoreContext));
  return useStore(store, selector);
}

export function SeanceDialog() {
  const seance = useSeanceDialogStore((s) => s.seance);
  const clearSeance = useSeanceDialogStore((s) => s.clearSeance);

  return (
    <Dialog modal={false} open={seance != null} onOpenChange={clearSeance}>
      {seance == null
        ? null
        : (function SeanceDialogBody() {
            const calendarEvent: CalendarEvent = {
              title: seance.movieTitle,
              start: seance.movieDate.toISO(),
              end: seance.movieDate.plus({ hours: 2 }).toISO(),
              duration: [2, "hours"],
              location: seance.movieTheater,
            };

            const links = {
              google: google(calendarEvent),
              ical: ics(calendarEvent),
              office365: office365(calendarEvent),
              outlook: outlook(calendarEvent),
              yahoo: yahoo(calendarEvent),
            };

            return (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter à votre calendrier</DialogTitle>
                </DialogHeader>
                {Object.entries(links).map(([type, link]) => (
                  <Button variant="outline" asChild key={type}>
                    <Link target="_blank" href={link}>
                      {type}
                    </Link>
                  </Button>
                ))}
                <DialogFooter className="sm:justify-end">
                  <DialogClose asChild>
                    <Button type="button">Retour</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            );
          })()}
    </Dialog>
  );
}
