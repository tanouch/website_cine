import clsx from "clsx";
import { ReactNode } from "react";

export function Titre({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-degular text-51px font-black uppercase leading-34px tracking-[0.01em] text-retro-gray lg:text-95px lg:leading-60px">
      {children}
    </h1>
  );
}

export function SousTitre1({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={clsx(
        className,
        "text-21px font-semibold uppercase leading-25px tracking-[-0.01em] text-retro-gray lg:text-29px lg:font-medium lg:leading-31px",
      )}
    >
      {children}
    </h2>
  );
}

export function SousTitre2({
  children,
  textColor = "retro-gray",
}: {
  children: ReactNode;
  textColor?: string;
}) {
  return (
    <div
      className={clsx(
        `text-${textColor}`,
        "text-21px font-semibold uppercase leading-25px tracking-normal lg:text-25px lg:leading-25px lg:tracking-[-0.01em]",
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        className,
        "flex flex-col border-y bg-retro-green px-10px py-10px text-center text-22px font-semibold uppercase leading-22px tracking-[-0.01em] text-retro-gray lg:py-20px",
      )}
    >
      <SousTitre2>{children}</SousTitre2>
    </div>
  );
}

export function SubsectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        className,
        "flex flex-col border-y bg-retro-pale-green px-10px py-10px text-center text-20px font-semibold leading-25px tracking-[-0.01em] text-retro-gray",
      )}
    >
      <div>{children}</div>
    </div>
  );
}

export function ButtonCopy({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        className,
        "text-17px font-medium uppercase leading-25px lg:text-20px lg:leading-21px",
      )}
    >
      {children}
    </div>
  );
}

export function MetaCopy({
  children,
  lowercase,
  size = "default", // add size parameter with "default" as default value
  className,
}: {
  children: ReactNode;
  lowercase?: boolean;
  size?: "default" | "small" | "large";
  className?: string;
}) {
  const sizeClasses = {
    default: "text-19px lg:text-20px lg:leading-22px",
    small: "text-16px lg:text-17px lg:leading-19px",
    large: "text-22px lg:text-23px lg:leading-25px",
  };

  return (
    <div
      className={clsx(
        {
          uppercase: !(lowercase ?? false),
        },
        "font-medium leading-21px text-retro-gray lg:tracking-[-0.01em]",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FooterCopy({ children }: { children: ReactNode }) {
  return (
    <div className="text-19px font-medium uppercase leading-21px tracking-[-0.01em] text-retro-gray lg:text-20px lg:leading-24px">
      {children}
    </div>
  );
}

export function BodyCopy({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        className,
        "text-15px font-medium leading-20px text-retro-black lg:text-16px lg:leading-23px",
      )}
    >
      {children}
    </div>
  );
}

export function CalendrierCopy({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        className,
        "text-15px font-medium leading-18px text-retro-black lg:text-16px lg:leading-20px",
      )}
    >
      {children}
    </div>
  );
}

export function CoeurWithSpacing() {
  return (
    <>
      c<span className="tracking-[-0.08em]">o</span>eur
    </>
  );
}
