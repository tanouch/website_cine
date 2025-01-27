"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode, useState } from "react";

import { SearchResults } from "@/app/recherche/recherche";
import { MiddleColumn } from "@/components/articles/articles";
import RetroInput from "@/components/forms/retro-input";
import { SuspenseWithLoading } from "@/components/icons/loading";
import { ThreeColumnPage } from "@/components/layout/page";
import PageHeader from "@/components/layout/page-header";
import { TextBox } from "@/components/layout/text-boxes";
import {
  BodyCopy,
  SousTitre1,
  SousTitre2,
} from "@/components/typography/typography";
import { SearchMovie } from "@/lib/types";

import LoadingPage from "../loading";
import logoBlue from "./logo-blue.png";

function OpenQuestion({
  question,
  value,
  onChangeFunction,
}: {
  question: string;
  value: string;
  onChangeFunction: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="flex flex-col pt-20px">
      <BodyCopy className="pb-5px">{question}</BodyCopy>
      <textarea
        placeholder={"Réponse facultative".toUpperCase()}
        value={value}
        onChange={(e) => onChangeFunction(e.target.value)}
        className="h-[75px] resize-none p-10px"
      />
    </div>
  );
}

function TextInputBox({
  placeholder,
  value,
  onChangeFunction,
  className,
  maxLength,
}: {
  placeholder: string;
  value: string;
  onChangeFunction: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  maxLength?: number;
}) {
  return (
    <div className={clsx(className, "flex flex-col py-10px")}>
      <input
        value={value}
        onChange={(e) => onChangeFunction(e.target.value)}
        className="border p-10px"
        placeholder={placeholder.toUpperCase()}
        maxLength={maxLength}
      />
    </div>
  );
}

function SondageRow({ cell1, cell2 }: { cell1: ReactNode; cell2: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-10px">
      <div className="w-42px lg:w-48px">{cell1}</div>
      <div className="flex grow basis-0">{cell2}</div>
    </div>
  );
}

function MovieRow({
  index,
  allMoviesPromise,
  onUpdate,
}: {
  index: number;
  allMoviesPromise: Promise<SearchMovie[]>;
  onUpdate: (data: { movie: string; id: string }) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [_, setMovieId] = useState("");
  const [showResults, setShowResults] = useState(false);
  const setSearchFind = (st: string, id: string = "") => {
    setSearchTerm(st);
    setMovieId(id);
    setShowResults(true);
    onUpdate({ movie: st, id: id });
  };
  return (
    <SondageRow
      cell1={
        <div className="flex h-full items-center justify-center border text-center text-retro-gray">
          {index + 1}
          {index < 5 && <span className="text-retro-red">*</span>}
        </div>
      }
      cell2={
        <div className="flex grow flex-col">
          <RetroInput
            value={searchTerm}
            setValue={(st) => setSearchFind(st)}
            blue={true}
            leftAlignPlaceholder
            customTypography
            placeholder={"Rechercher un film...".toUpperCase()}
            transparentPlaceholder
          />
          <SuspenseWithLoading hideLoading={searchTerm.length === 0}>
            {showResults && (
              <SearchResults
                altColor={true}
                className="border-x px-5px py-2px"
                nbResults={5}
                searchTerm={searchTerm}
                allDataPromise={allMoviesPromise}
                noResultsText="Nous ne trouvons pas votre film, mais vous pouvez le renseigner manuellement."
                noResultsTextSize="small"
                lowercase={true}
                onClick={(movie) => {
                  setSearchFind(
                    `${movie.title}, ${movie.directors} (${movie.year})`,
                    movie.id,
                  );
                  setShowResults(false);
                }}
                onClose={() => {
                  setShowResults(false);
                }}
              />
            )}
          </SuspenseWithLoading>
        </div>
      }
    />
  );
}

interface ShareableContentProps {
  rowsData: {
    movie: string;
    id: string;
  }[];
}

function ShareableContent({ rowsData }: ShareableContentProps) {
  const filteredMovies = rowsData.filter((row) => row.movie !== "");
  // const cornerTextStyle = "font-semi-bold text-retro-blue underline hidden lg:block uppercase";
  const cornerTextStyle = "font-semibold text-[13px] text-retro-blue uppercase";
  return (
    <div className="w-[100%] bg-retro-bordeaux lg:w-500px">
      <div className="p-10px lg:p-16px">
        <div className="relative flex grow items-start">
          <div
            className={`absolute left-0 top-0 flex h-full flex-col ${cornerTextStyle}`}
          >
            <div className="text-30px leading-15px">•</div>
            <div className="pt-35px underline">Top 2024</div>
          </div>
          <div className="flex grow items-center justify-center text-center font-degular text-40px font-black uppercase leading-35px tracking-[0.01em] text-retro-blue">
            Ma Rétro
            <br />
            2024
          </div>
          <div className={`absolute right-0 top-0 ${cornerTextStyle}`}>
            <div className="text-right text-30px leading-15px">•</div>
            <div className="pt-35px underline">#MaRétro</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-retro-blue px-10px py-10px lg:px-16px">
        {filteredMovies.map((row, index) => (
          <div
            key={index}
            className={clsx(
              "flex w-full justify-center border-retro-bordeaux px-10px py-6px text-center",
              index === 0
                ? "border-b-[0.5px]"
                : index === filteredMovies.length - 1
                  ? "border-t-[0.5px]"
                  : "border-y-[0.5px]",
            )}
          >
            <BodyCopy className="text-retro-bordeaux">
              {index + 1}. {row.movie}
            </BodyCopy>
          </div>
        ))}
      </div>
      <div className="p-10px lg:p-16px">
        <div className="relative flex grow items-end">
          <div className={`absolute bottom-0 left-0 ${cornerTextStyle}`}>
            <div className="pb-10px underline"> Top 2024</div>
            <div className="text-30px leading-15px">•</div>
          </div>
          <div className="flex grow items-center justify-center">
            <Image
              src={logoBlue}
              alt="Logo"
              className="h-auto w-157px max-w-[50%]"
            />
          </div>
          <div className={`absolute bottom-0 right-0 ${cornerTextStyle}`}>
            <div className="pb-10px underline"> #MaRétro </div>
            <div className="text-right text-30px leading-15px">•</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SharePage({ rowsData }: ShareableContentProps) {
  return (
    <>
      <div className="flex justify-center pb-20px" id="shareableContent">
        <ShareableContent rowsData={rowsData} />
      </div>
      <BodyCopy className="border-t py-20px">
        Merci pour votre participation&nbsp;! N&apos;hésitez pas à partager
        votre rétrospective 2024 et à encourager vos ami·es à en faire
        autant&nbsp;!
      </BodyCopy>
      <div className="flex flex-col gap-y-10px">
        <TextBox onClick={() => window.location.reload()}>
          Recomposer ma rétrospective
        </TextBox>
      </div>
    </>
  );
}

export default function MaRetro2024({
  allMoviesPromise,
}: {
  allMoviesPromise: Promise<SearchMovie[]>;
}) {
  const numSubmissions = 10;
  const [responseMessage, setResponseMessage] = useState("");
  const [rowsData, setRowsData] = useState(
    Array(numSubmissions).fill({
      movie: "",
      id: "",
    }),
  );
  const [fullName, setFullName] = useState("");
  const [showSharePage, setShowSharePage] = useState(false);
  const [real, setReal] = useState("");
  const [nombreDeFois, setNombreDeFois] = useState("");
  const [autreInformation, setAutreInformation] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateRowData = (
    index: number,
    data: {
      movie: string;
      id: string;
    },
  ) => {
    const newRowsData = [...rowsData];
    newRowsData[index] = data;
    setRowsData(newRowsData);
  };
  const handleSubmit = async () => {
    // Check if at least one movie has been filled
    const hasAtLeastTwoMovies =
      rowsData.filter((row) => row.movie.trim() !== "").length >= 2;
    if (!hasAtLeastTwoMovies) {
      setResponseMessage("Veuillez sélectionner au moins cinq films.");
      return;
    }
    setIsSubmitting(true);
    try {
      const API_ENDPOINT =
        "https://europe-west1-website-cine.cloudfunctions.net/trigger_upload_poll_data_to_db";
      const transformedData = rowsData
        .filter((row) => row.movie !== "")
        .map((row) => ({
          movie: row.movie,
          id: row.id,
        }));
      const payload = {
        collection_name: "sondage-2024",
        votes: transformedData,
        director_requests: real,
        cinema_visits: nombreDeFois,
        additional_feedback: autreInformation,
        full_name: fullName,
        email: email,
        newsletter_signup: newsletter,
      };
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setResponseMessage("Données envoyées avec succès!");
      setShowSharePage(true);
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("Erreur lors de l'envoi. Veuillez réessayer.");
    }
    setIsSubmitting(false);
  };
  return (
    <>
      <PageHeader text="Ma Rétro 2024">
        <SousTitre1>Votez pour vos plus belles découvertes&nbsp;!</SousTitre1>
      </PageHeader>
      {isSubmitting ? (
        <LoadingPage />
      ) : (
        <ThreeColumnPage>
          <MiddleColumn>
            {showSharePage ? (
              <SharePage rowsData={rowsData} />
            ) : (
              <>
                <BodyCopy className="flex flex-col gap-y-10px">
                  <div>
                    L&apos;année 2024 a été{" "}
                    <Link href="/coeur" className="underline">
                      riche en ressorties cinéma
                    </Link>
                    . Et vous, quels ont été vos coups de cœur de
                    l&apos;année&nbsp;? En cette saison des tops à-tout-va, Le
                    Rétro Projecteur vous propose de concocter un petit
                    classement de vos plus belles découvertes&nbsp;!
                  </div>
                  <div>
                    <b>NB&nbsp;:</b> Est éligible tout film vieux de plus de
                    trois ans. Si vous ne trouvez pas votre choix dans les
                    propositions, entrez les informations du films manuellement
                    et passez à la case suivante.
                  </div>
                </BodyCopy>
                {/* Name */}
                <TextInputBox
                  placeholder="Votre nom ou pseudo"
                  value={fullName}
                  onChangeFunction={setFullName}
                  className="py-15px lg:py-20px"
                  maxLength={15}
                />
                {/* Top */}
                <div className="flex flex-col gap-y-10px">
                  <div className="border-y bg-retro-blue uppercase">
                    <SondageRow
                      cell1={
                        <div className="py-6px text-center font-bold lg:py-17px">
                          <SousTitre2>#</SousTitre2>
                        </div>
                      }
                      cell2={
                        <div className="py-6px text-center font-bold lg:py-17px">
                          <SousTitre2>Film</SousTitre2>
                        </div>
                      }
                    />
                  </div>
                  {rowsData.map((_, index) => (
                    <MovieRow
                      key={index}
                      index={index}
                      allMoviesPromise={allMoviesPromise}
                      onUpdate={(data) => updateRowData(index, data)}
                    />
                  ))}
                </div>
                <div className="pt-10px">
                  {/* Additional Questions */}
                  <OpenQuestion
                    question="Y a-t-il des films ou des réalisateur·ices en particulier que vous aimeriez voir plus souvent programmé·es en salle&nbsp;?"
                    value={real}
                    onChangeFunction={setReal}
                  />
                  <OpenQuestion
                    question="À combien estimez-vous le nombre de fois où vous êtes allé·es voir un film en ressortie au cinéma cette année&nbsp;?"
                    value={nombreDeFois}
                    onChangeFunction={setNombreDeFois}
                  />
                  <OpenQuestion
                    question="Des retours supplémentaires sur notre projet ou sur notre site web&nbsp;?"
                    value={autreInformation}
                    onChangeFunction={setAutreInformation}
                  />
                  {/* Newsletter Signup */}
                  <div className="py-30px">
                    <div className="border bg-retro-blue p-10px">
                      <div className="flex items-start gap-x-10px">
                        <div
                          onClick={() => setNewsletter(!newsletter)}
                          className="flex h-20px min-w-20px cursor-pointer items-center justify-center border border-retro-gray bg-white"
                        >
                          {newsletter && <p className="text-retro-gray">✓</p>}
                        </div>
                        <label className="cursor-pointer text-retro-gray">
                          Je souhaite m&apos;inscrire à «&nbsp;Up Close&nbsp;»,
                          la newsletter hebdomadaire du Rétro Projecteur pour
                          recevoir l&apos;actualité des ressorties cinéma&nbsp;!
                        </label>
                      </div>
                      {newsletter && (
                        <TextInputBox
                          placeholder="Votre adresse email*"
                          value={email}
                          onChangeFunction={setEmail}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <TextBox
                  onClick={handleSubmit}
                  className="bg-retro-gray text-retro-white hover:bg-retro-bordeaux"
                >
                  Envoyer mon top 2024&nbsp;!
                </TextBox>
                <p className="mt-4 font-semibold">{responseMessage}</p>
              </>
            )}
          </MiddleColumn>
        </ThreeColumnPage>
      )}
    </>
  );
}
