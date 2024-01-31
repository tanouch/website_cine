import clsx from "clsx";
import { ReactNode } from "react";

import { Titre } from "../typography/typography";

export default function PageHeader({
  children,
  text,
}: {
  children?: ReactNode;
  text: string;
}) {
  return (
    <FixedHeader className="flex flex-col">
      <div>
        <div className="grow whitespace-break-spaces border-y bg-retro-green py-18px text-center lg:w-max lg:whitespace-nowrap lg:border-0 lg:bg-white lg:py-0 lg:pl-20px lg:text-left">
          <Titre>{text}</Titre>
        </div>
      </div>
      {children && (
        <div className="lg:pt-20px">
          <div className="flex items-center justify-center border-b py-14px lg:justify-start lg:border-t lg:bg-retro-green lg:pl-20px lg:pr-10px">
            {children}
          </div>
        </div>
      )}
    </FixedHeader>
  );
}

export function FixedHeader({
  children,
  className,
  disableBelowPadding,
}: {
  children: ReactNode;
  className?: string;
  disableBelowPadding?: boolean;
}) {
  return (
    <div
      className={clsx(
        className,
        {
          "pb-15px lg:pb-32px": !(disableBelowPadding ?? false),
        },
        "z-20 flex flex-col bg-white lg:sticky lg:top-0 lg:pt-20px",
      )}
    >
      {children}
    </div>
  );
}
