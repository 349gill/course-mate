import React, { useState, useRef, useEffect } from "react";

import { getRemainingCourses, prerequisiteInfo } from "../utils/utils";

import DegreeForm from "../components/DegreeForm";
import RenderGraph from "../components/RenderGraph";
import RemainingCourses from "../components/RemainingCourses";

export default function Home() {
  const [degree, setDegree] = useState("");
  const [courses, setCourses] = useState("");
  const [remainingCourses, setRemainingCourses] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);

  const [nodeDataArray, setNodeDataArray] = useState([]);
  const [linkDataArray, setLinkDataArray] = useState([]);

  const remainingCoursesRef = useRef(null);

  useEffect(() => {
    if (
      shouldScroll &&
      !isLoading &&
      Object.keys(remainingCourses).length > 0
    ) {
      remainingCoursesRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScroll(false);
    }
  }, [isLoading, remainingCourses, shouldScroll]);

  const handleFormSubmit = async (degree, courses) => {
    if (!degree) {
      setErrorMessage("Please select a program.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setShouldScroll(true);

    try {
      const completedCourses = courses.split(",").map((course) =>
        course
          .replace(/([A-Za-z]{2,6})\s?(\d{3})/gi, "$1 $2")
          .trim()
          .toUpperCase()
      );

      const remaining = await getRemainingCourses(degree, completedCourses);
      const nodeDataArray = [];
      const linkDataArray = [];

      const remainingCoursesFlat = Object.values(remaining).flat();

      let link = 0;
      for (const item of remainingCoursesFlat) {
        if (item) {
          nodeDataArray.push({ key: item, completed: 0 });
          const response = await prerequisiteInfo(item);
          const prerequisites = Object.values(response).flat();

          if (Array.isArray(prerequisites)) {
            for (const course of prerequisites) {
              if (course) {
                nodeDataArray.push({ key: course, completed: 0 });
                linkDataArray.push({ from: course, to: item, key: link++ });
              }
            }
          }
        }
      }

      setNodeDataArray(nodeDataArray);
      setLinkDataArray(linkDataArray);
      setRemainingCourses(remaining);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800">CourseMate</h1>
        <p className="text-lg text-gray-600">
          Plan your Computing Science degree at University of Alberta
        </p>
      </header>

      <br />

      <DegreeForm
        setDegree={(degree) => {
          setDegree(degree);
          if (degree) setErrorMessage("");
        }}
        setCourses={setCourses}
        handleSubmit={handleFormSubmit}
        errorMessage={errorMessage}
      />

      {isLoading ? (
        <div className="text-center mt-8">
          <div className="spinner border-t-4 border-green-500 rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-green-600 mt-4">Loading data...</p>
        </div>
      ) : null}

      <br />

      <div className="flex-1" ref={remainingCoursesRef}>
        {!isLoading && <RemainingCourses courses={remainingCourses} />}
      </div>

      <br />

      {!isLoading && (
        <RenderGraph
          nodeDataArray={nodeDataArray}
          linkDataArray={linkDataArray}
        />
      )}
    </div>
  );
}
