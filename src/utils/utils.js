import go from "gojs";

import General from "/public/programs/general.json";
import Honors from "/public/programs/honors.json";
import Spec from "/public/programs/spec.json";

const degreeRequirements = {
  "Bachelor of Science General": General,
  "Bachelor of Science Honors": Honors,
  "Bachelor of Science Specialization": Spec,
};

export const getRemainingCourses = (degree, completedCourses) => {
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

export const prerequisiteInfo = async (course) => {
  if (!course) return [];
  try {
    const response = await fetch(`/api/${encodeURIComponent(course)}`);
    const page = await response.json();
    return page.courses;
  } catch (Error) {
    return [];
  }
};

// Extract individual course codes (e.g. "CMPUT 204") from raw prerequisite
// sentences like "CMPUT 175 or 275, and CMPUT 272" or
// "one of MATH 100, 114, 117, 134, 144, or 154".
// Bare numbers inherit the most recently seen subject.
const CONNECTOR_WORDS = new Set([
  "AND",
  "OR",
  "NOR",
  "ONE",
  "TWO",
  "OF",
  "THE",
  "FOR",
  "IN",
  "WITH",
  "FROM",
  "EITHER",
  "NEITHER",
  "BOTH",
  "EACH",
  "ANY",
  "ALL",
  "AN",
  "A",
]);
export const parseCourseCodes = (raw) => {
  if (!raw) return [];
  const text = String(raw).toUpperCase();
  const results = [];
  let lastSubject = null;
  const re = /([A-Z]{2,6})?\s*(\d{3}[A-Z]?)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    let subject = m[1] || null;
    const num = m[2];
    if (subject && CONNECTOR_WORDS.has(subject)) subject = null;
    subject = subject || lastSubject;
    if (!subject) continue;
    // Don't let connectors become the remembered subject
    if (!CONNECTOR_WORDS.has(subject)) lastSubject = subject;
    if (subject.length >= 2 && subject.length <= 6) {
      const code = `${subject} ${num}`;
      if (!results.includes(code)) results.push(code);
    }
  }
  return results;
};

export const initDiagram = () => {
  const myDiagram = new go.Diagram({
    "undoManager.isEnabled": true,
    layout: new go.LayeredDigraphLayout({
      direction: 90,
      layerSpacing: 50,
      columnSpacing: 30,
      setsPortSpots: false,
    }),
    initialContentAlignment: go.Spot.Center,
    contentAlignment: go.Spot.Center,
    'animationManager.isEnabled': false,
    isReadOnly: false,
    initialScale: 1.0,
    minScale: 0.25,  // minimum 25% zoom
    maxScale: 2.0,   // maximum 200% zoom
    'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,

    allowRelink: false,
    allowLink: false,
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
      link: "#0284c7",
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
      link: "#38bdf8",
      div: "#1f2937",
    },
  });

  myDiagram.themeManager.currentTheme = "light";

  myDiagram.addDiagramListener("InitialLayoutCompleted", (e) => {
    const diagram = e.diagram;
    diagram.zoomToFit();
  
    if (diagram.scale < 0.25) diagram.scale = 0.25;
    if (diagram.scale > 2) diagram.scale = 2;
    
    diagram.contentAlignment = go.Spot.Center;
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
      }).bind("fill", "completed", (completed) => {
        if (completed === 0) return "#77DD77";
        if (completed === 1) return "#FAA0A0";
        return "#C3B1E1";
      }),
      new go.TextBlock("Default Text", {
        margin: 15,
        stroke: "white",
        font: "bold 20px sans-serif",
      }).bind("text", "key")
    );

  myDiagram.linkTemplate = new go.Link({
    routing: go.Routing.Orthogonal,
    selectionAdorned: false,
    corner: 5,
    toShortLength: 4,
    fromSpot: go.Spot.Bottom,
    toSpot: go.Spot.Top,
  })
    .add(
      new go.Shape({ strokeWidth: 2.5, stroke: "#0284c7" }).theme(
        "stroke",
        "link"
      ),
      new go.Shape({ toArrow: "Standard", strokeWidth: 0, fill: "#0284c7" }).theme(
        "fill",
        "link"
      )
    );

  function openlink(e, obj) {
    window.open(obj.url);
  }

  return myDiagram;
};
