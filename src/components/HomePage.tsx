"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLanguageChange = (newLanguage: string) => {
    router.push(`/${newLanguage}`);
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <p>Choose a language:</p>

      <div className="flex flex-row justify-center items-center">
        <button
          style={{ fontSize: "20px", padding: "10px" }}
          onClick={() => handleLanguageChange("en")}
        >
          English
        </button>
        <button
          style={{ fontSize: "20px", padding: "10px" }}
          onClick={() => handleLanguageChange("tr")}
        >
          Turkish
        </button>
      </div>
    </div>
  );
}
