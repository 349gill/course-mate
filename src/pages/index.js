import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import { React, useState, useEffect, useRef } from "react";

import General from "/public/programs/general.json";
import Honors from "/public/programs/honors.json";
import Spec from "/public/programs/spec.json";

const degreeRequirements = {
  "Bachelor of Science General": General,
  "Bachelor of Science Honors": Honors,
  "Bachelor of Science Specialization": Spec,
};

const getRemainingCourses = (degree, completedCourses) => {
  const response = degreeRequirements[degree];

  if (!response || !response.Major) {
    return {};
  }

  let remainingCourses = {};

  for (const subheading in response.Major) {
    if (response.Major[subheading] && response.Major[subheading].list) {
      const intersection = response.Major[subheading].list.filter((course) =>
        completedCourses.includes(course)
      );

      const unitsLeft =
        response.Major[subheading].units - intersection.length * 3;
      if (unitsLeft > 0) {
        remainingCourses[`${subheading}: ${unitsLeft} units`] = response.Major[
          subheading
        ].list.filter((course) => !intersection.includes(course));
      }
    }
  }

  return remainingCourses;
};

function initDiagram() {
  const $ = go.GraphObject.make;
  const myDiagram = $(go.Diagram, {
    "undoManager.isEnabled": true,
    layout: $(go.LayeredDigraphLayout, {
      direction: 90,
      layerSpacing: 40,
      columnSpacing: 40,
    }),
    model: new go.GraphLinksModel({
      linkKeyProperty: "key",
    }),
  });

  myDiagram.nodeTemplate = $(
    go.Node,
    "Auto",
    {
      isShadowed: true,
      shadowBlur: 0,
      shadowOffset: new go.Point(3.5, 3.5),
      shadowColor: "rgba(0,0,0,0.3)",
    },
    $(
      go.Shape,
      "RoundedRectangle",
      {
        strokeWidth: 2,
        fill: "white",
      },
      new go.Binding("fill", "completed", (completed) =>
        completed === 1 ? "#77DD77" : "#44CCFF"
      )
    ),
    $(
      go.TextBlock,
      {
        margin: 15,
        stroke: "#000",
        font: "bold 16px sans-serif",
      },
      new go.Binding("text", "key")
    )
  );

  myDiagram.linkTemplate = $(
    go.Link,
    {
      routing: go.Link.Orthogonal,
      corner: 5,
    },
    $(go.Shape, { strokeWidth: 2, stroke: "#555" })
  );

  return myDiagram;
}

export default function Home() {
  const [degree, setDegree] = useState("");
  const [courses, setCourses] = useState("");
  const [remainingCourses, setRemainingCourses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [nodeDataArray, setNodeDataArray] = useState([]);
  const [linkDataArray, setLinkDataArray] = useState([]);

  const remainingCoursesRef = useRef(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!degree) {
      setErrorMessage("Please select a program.");
      return;
    }

    const completedCourses = courses.split(",").map((course) =>
      course
        .replace(/([A-Za-z]{2, 6})\s?(\d{3})/gi, "$1 $2")
        .trim()
        .toUpperCase()
    );

    const remaining = await getRemainingCourses(degree, completedCourses);
    setRemainingCourses(remaining);

    const nodeDataArray = [];
    const linkDataArray = [];

    const remainingCoursesFlat = Object.values(remaining).flat();

    let link = 0;

    for (const item of remainingCoursesFlat) {
      nodeDataArray.push({ key: item, completed: 0 });
      const prerequisites = await prerequisiteInfo(item);

      if (Array.isArray(prerequisites)) {
        for (const course of prerequisites) {
          nodeDataArray.push({ key: item, completed: 0 });
          linkDataArray.push({ from: course, to: item, key: link++ });
        }
      }
    }

    for (const item of completedCourses) {
      nodeDataArray.push({ key: item, completed: 1 });
      const prerequisites = await prerequisiteInfo(item);

      if (Array.isArray(prerequisites)) {
        for (const course of prerequisites) {
          nodeDataArray.push({ key: item, completed: 1 });
          linkDataArray.push({ from: course, to: item, key: link++ });
        }
      }
    }

    setNodeDataArray(nodeDataArray);
    setLinkDataArray(linkDataArray);

    remainingCoursesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800">CourseMate</h1>
        <p className="text-lg text-gray-600">
          Plan your Computing Science degree at University of Alberta
        </p>
      </header>
      <form onSubmit={handleFormSubmit} className="space-y-4 max-w-lg mx-auto">
        <div className="relative">
          <select
            value={degree}
            onChange={(e) => {
              setDegree(e.target.value);
              if (e.target.value) {
                setErrorMessage("");
              }
            }}
            className="p-3 bg-white border-2 border-gray-300 rounded-md shadow-sm w-full focus:ring-2 focus:ring-green-600 focus:outline-none"
          >
            <option value="">Select your degree</option>
            <option value="Bachelor of Science General">
              Bachelor of Science General
            </option>
            <option value="Bachelor of Science Honors">
              Bachelor of Science Honors
            </option>
            <option value="Bachelor of Science Specialization">
              Bachelor of Science Specialization
            </option>
          </select>

          {errorMessage && (
            <p className="text-red-600 mt-2 font-semibold">{errorMessage}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            value={courses}
            onChange={(e) => setCourses(e.target.value)}
            className="p-3 bg-white border-2 border-gray-300 rounded-md shadow-sm w-full focus:ring-2 focus:ring-green-600 focus:outline-none"
            placeholder="Add completed courses (e.g., CMPUT 174, MATH 144)"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-green-800 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
        >
          Submit
        </button>
      </form>

      <br></br>

      <div className="flex-1" ref={remainingCoursesRef}>
        <RemainingCourses courses={remainingCourses} />
      </div>

      <RenderGraph
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
      />
    </div>
  );
}

const RenderGraph = ({ nodeDataArray, linkDataArray }) => {
  return (
    <div style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-component"
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
        className="h-full w-full"
      />
    </div>
  );
};

const RemainingCourses = ({ courses }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const timeout = setTimeout(() => setAnimate(true), 250);
    return () => clearTimeout(timeout);
  }, [courses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(courses).map(([category, items], index) => (
        <div
          key={index}
          style={{
            opacity: animate ? 1 : 0,
            transform: animate ? "translateY(0)" : "translateY(25px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
          className="bg-gray-100 p-4 rounded-md shadow"
        >
          <h3 className="text-lg font-medium mb-2">{category}</h3>
          <ul className="space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const prerequisiteInfo = async (course) => {
  if (!course) return [];
  try {
    const response = await fetch(`/api/${encodeURIComponent(course)}`);
    const page = await response.json();
    return page.courses;
  } catch (Error) {
    return [];
  }
};
