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

export const initDiagram = () => {
  const myDiagram = new go.Diagram({
    viewSize: new go.Size(1200, 500),

    allowRelink: false,
    allowLink: false,

    "undoManager.isEnabled": true,
    layout: new go.GridLayout({
      angle: 90,
      layerSpacing: 50,
      nodeSpacing: 0,
      direction: 90,
      columnSpacing: 50,
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
      }).bind("fill", "completed", (completed) => {
        if (completed === 0) return "#77DD77";
        if (completed === 1) return "#FAA0A0";
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
  }).add(new go.Shape({ strokeWidth: 3 }).theme("stroke", "link"));

  function openlink(e, obj) {
    window.open(obj.url);
  }
  return myDiagram;
};
