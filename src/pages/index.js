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
  const myDiagram = new go.Diagram({
    viewSize: new go.Size(800, 500),

    allowRelink: false,
    allowLink: false,

    "undoManager.isEnabled": true,
    layout: new go.LayeredDigraphLayout({
      angle: 90,
      layerSpacing: 40,
      nodeSpacing: 20,
      direction: 90,
      columnSpacing: 40,
    }),

    model: new go.GraphLinksModel({
      linkKeyProperty: "key",
    }),
  });
  myDiagram.themeManager.set("light", {
    colors: {
      background: "#fff",
      text: "#111827",
      textHighlight: "#11a8cd",
      subtext: "#6b7280",
      badge: "#f0fdf4",
      badgeBorder: "#16a34a33",
      badgeText: "#15803d",
      divider: "#6b7280",
      shadow: "#9ca3af",
      tooltip: "#1f2937",
      levels: [
        "#AC193D",
        "#2672EC",
        "#8C0095",
        "#5133AB",
        "#008299",
        "#D24726",
        "#008A00",
        "#094AB2",
      ],
      dragOver: "#f0f9ff",
      link: "#ADD8E6",
      div: "#f3f4f6",
    },
    fonts: {
      name: "500 0.875rem InterVariable, sans-serif",
      normal: "0.875rem InterVariable, sans-serif",
      badge: "500 0.75rem InterVariable, sans-serif",
      link: "600 0.875rem InterVariable, sans-serif",
    },
  });

  myDiagram.themeManager.set("dark", {
    colors: {
      background: "#111827",
      text: "#fff",
      subtext: "#d1d5db",
      badge: "#22c55e19",
      badgeBorder: "#22c55e21",
      badgeText: "#4ade80",
      shadow: "#111827",
      dragOver: "#082f49",
      link: "#ADD8E6",
      div: "#1f2937",
    },
  });

  myDiagram.addDiagramListener("InitialLayoutCompleted", () => {
    myDiagram.zoomToFit();
  });

  myDiagram.nodeTemplate = new go.Node("Auto", {
    isShadowed: true,
    shadowBlur: 0,
    layerName: "Foreground",
    shadowOffset: new go.Point(3.5, 3.5),
    shadowColor: "black",
    doubleClick: openlink,
  })
    .bind("url", "link")
    .add(
      new go.Shape("RoundedRectangle", {
        strokeWidth: 2,
        fill: "#44CCFF",
        portId: "",
        fromLinkable: true,
        fromLinkableSelfNode: false,
        fromLinkableDuplicates: true,
        toLinkable: true,
        toLinkableSelfNode: false,
        toLinkableDuplicates: true,
        cursor: "pointer",
      }).bind("fill", "type", (type) => {
        if (type === "taken") return "#77DD77";
        if (type === "rec") return "#FAA0A0";
        return "C3B1E1";
      }),
      new go.TextBlock("Default Text", {
        margin: 15,
        stroke: "white",
        font: "bold 20px sans-serif",
      }).bind("text", "key")
    );

  myDiagram.linkTemplate = new go.Link({
    routing: go.Routing.Orthogonal,
    layerName: "Background",
    selectionAdorned: false,
    corner: 5,
  }).add(new go.Shape({ strokeWidth: 3 }).theme("stroke", "link")); // the link shape

  function openlink(e, obj) {
    window.open(obj.url);
  }
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

    for (const item of completedCourses) {
      if (item) {
        nodeDataArray.push({ key: item, completed: 1 });
        const response = await prerequisiteInfo(item);
        const prerequisites = Object.values(response).flat();

        if (Array.isArray(prerequisites)) {
          for (const course of prerequisites) {
            if (course) {
              nodeDataArray.push({ key: course, completed: 1 });
              linkDataArray.push({ from: course, to: item, key: link++ });
            }
          }
        }
      }
    }

    setNodeDataArray(nodeDataArray);
    setLinkDataArray(linkDataArray);

    setRemainingCourses(remaining);
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
  const diagramRef = useRef();

  useEffect(() => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();
      if (diagram) {
        diagram.zoomToFit(); // Fit content when data changes
      }
    }
  }, [nodeDataArray, linkDataArray]);

  return (
    <div>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-component"
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
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
