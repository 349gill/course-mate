import { useState, useEffect } from "react";
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';

const degreeRequirements = {
  "BSc Computing Science General": "/programs/gen.json",
  "BSc Computing Science Honors": "/programs/hons.json",
  "BSc Computing Science Specialization": "/programs/spec.json",
  "BSc Computing Science Honors (2024)": "/programs/new_hons.json",
  "BSc Computing Science Major (2024)": "/programs/new_major.json",
};

const getRemainingCourses = async (degree, completedCourses) => {
  const degreePath = degreeRequirements[degree];
  if (!degreePath) return [];

  try {
    const response = await fetch(degreePath);
    const degreeData = await response.json();

    const remainingCourses = [];

    Object.keys(degreeData.major).forEach((category) => {
      let units = 0;
      const { list, units: requiredUnits } = degreeData.major[category];

      list.forEach((course) => {
        if (completedCourses.includes(course)) {
          units += 3;
        } else if (units < requiredUnits) {
          remainingCourses.push(course);
          units += 3;
        }
      });
    });

    return remainingCourses;
  } catch (error) {
    console.error("Error fetching degree requirements.", error);
    return [];
  }
};

function initDiagram() {
  const myDiagram = 
  new go.Diagram(
    {
      viewSize: new go.Size(1000,500),

      "allowRelink": false,
      "allowLink": false,

      "undoManager.isEnabled": true,
      layout: new go.LayeredDigraphLayout({
              direction: 0,
              layerSpacing: 40,
              columnSpacing: 40,
            }
      ),
      model: new go.GraphLinksModel(
        {
          linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        })
    });
  myDiagram.themeManager.set('light', {
    colors: {
      background: '#fff',
      text: '#111827',
      textHighlight: '#11a8cd',
      subtext: '#6b7280',
      badge: '#f0fdf4',
      badgeBorder: '#16a34a33',
      badgeText: '#15803d',
      divider: '#6b7280',
      shadow: '#9ca3af',
      tooltip: '#1f2937',
      levels: [
        '#AC193D',
        '#2672EC',
        '#8C0095',
        '#5133AB',
        '#008299',
        '#D24726',
        '#008A00',
        '#094AB2'
      ],
      dragOver: '#f0f9ff',
      link: '#FFFF00',
      div: '#f3f4f6'
    },
    fonts: {
      name: '500 0.875rem InterVariable, sans-serif',
      normal: '0.875rem InterVariable, sans-serif',
      badge: '500 0.75rem InterVariable, sans-serif',
      link: '600 0.875rem InterVariable, sans-serif'
    }
  });

  myDiagram.themeManager.set('dark', {
    colors: {
      background: '#111827',
      text: '#fff',
      subtext: '#d1d5db',
      badge: '#22c55e19',
      badgeBorder: '#22c55e21',
      badgeText: '#4ade80',
      shadow: '#111827',
      dragOver: '#082f49',
      link: '#FFFF00',
      div: '#1f2937'
    }
  });

  myDiagram.nodeTemplate =
    new go.Node("Auto",
      { isShadowed: true,
        shadowBlur: 0,
        layerName: 'Foreground',
        shadowOffset: new go.Point(3.5,3.5),
        shadowColor: 'black',
        //background: "#44CCFF",
        doubleClick: openlink
      }).bind("url", "link")
    .add(
      new go.Shape('RoundedRectangle', {
        strokeWidth: 2,
        fill: "#44CCFF",
        portId: '',
        fromLinkable: true, fromLinkableSelfNode: false, fromLinkableDuplicates: true,
        toLinkable: true, toLinkableSelfNode: false, toLinkableDuplicates: true,
        cursor: 'pointer'
      }) .bind('fill', 'type', (type) => {
          if (type === 'taken') return '#77DD77';
          if (type === 'rec') return '#FAA0A0';
          return 'C3B1E1';
        }),
      new go.TextBlock("Default Text",
        { margin: 15, stroke: "white", font: "bold 20px sans-serif" })
      .bind("text", "key")
    );
    // new go.Shape("RoundedRectangle")
    //   .bind("figure", "fig")

  myDiagram.linkTemplate = new go.Link({
    routing: go.Routing.Orthogonal,
    layerName: 'Background',
    selectionAdorned: false,  // don't bother with any selection adornment
    corner: 5
  })
  .add(new go.Shape({ strokeWidth: 3 }).theme('stroke', 'link')); // the link shape
  
  function openlink(e, obj) {
    window.open(obj.url);
  }
  return myDiagram;
}

export default function Home() {
  const [degree, setDegree] = useState("");
  const [courses, setCourses] = useState("");
  const [remainingCourses, setRemainingCourses] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const completedCourses = courses.split(",").map((course) => course.trim());
    const remaining = await getRemainingCourses(degree, completedCourses);
    setRemainingCourses(remaining);
    setFadeIn(true);
  };

  useEffect(() => {
    if (remainingCourses.length > 0) {
      setFadeIn(false);
      setTimeout(() => setFadeIn(true), 10);
    }
  }, [remainingCourses]);

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800">CourseMate</h1>
        <p className="text-lg text-gray-600">
          Plan your Computer Science degree at the University of Alberta
        </p>
      </header>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-uofa_green font-medium">Program:</label>
          <select
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select your degree</option>
            <option value="BSc Computing Science General">
              BSc Computing Science General
            </option>
            <option value="BSc Computing Science Honors">
              BSc Computing Science Honors
            </option>
            <option value="BSc Computing Science Specialization">
              BSc Computing Science Specialization
            </option>
            <option value="BSc Computing Science Honors (2024)">
              BSc Computing Science Honors (2024)
            </option>
            <option value="BSc Computing Science Major (2024)">
              BSc Computing Science Major (2024)
            </option>
          </select>
        </div>

        <div>
          <label className="block font-medium">
            Completed Courses (comma separated):
          </label>
          <input
            type="text"
            value={courses}
            onChange={(e) => setCourses(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            placeholder="e.g., CMPUT 174, CMPUT 175"
          />
        </div>

        <button
          type="submit"
          className="bg-green-800 text-white p-2 rounded w-full hover:bg-green-900"
        >
          Submit
        </button>
      </form>

      {remainingCourses.length > 0 && (
        <div className={`mt-8 fade-in ${fadeIn ? 'fade-in-active' : ''}`}>
          <h2 className="text-2xl text-uofa_gold font-semibold">
            Remaining Courses:
          </h2>
          <ul className="list-disc list-inside">
            {remainingCourses.map((course, index) => (
              <li key={index} className="text-lg">
                {course}
              </li>
            ))}
          </ul>
        </div>
      )}
    <ReactDiagram
initDiagram={initDiagram}
divClassName='diagram-component'  
  nodeDataArray = { [
    {"key":"CMPUT 174","link":"https://apps.ualberta.ca/catalogue/course/cmput/174","type":"taken"},
    {"key":"CMPUT 175","link":"https://apps.ualberta.ca/catalogue/course/cmput/175","type":"taken"},
    {"key":"CMPUT 201","link":"https://apps.ualberta.ca/catalogue/course/cmput/201","type":"taken"},
    {"key":"CMPUT 204","link":"https://apps.ualberta.ca/catalogue/course/cmput/204","type":"taken"},
    {"key":"CMPUT 229","link":"https://apps.ualberta.ca/catalogue/course/cmput/229","type":"rec"},
    {"key":"CMPUT 272","link":"https://apps.ualberta.ca/catalogue/course/cmput/272","type":"rec"},
    {"key":"CMPUT 304","link":"https://apps.ualberta.ca/catalogue/course/math/117","type":"rec"}
    ]}
  linkDataArray = {[
{"from":"CMPUT 174","to":"CMPUT 175"},
{"from":"CMPUT 175","to":"CMPUT 201"},
{"from":"CMPUT 201","to":"CMPUT 272"},
{"from":"CMPUT 201","to":"CMPUT 204"},
{"from":"CMPUT 201","to":"CMPUT 229"},
{"from":"CMPUT 204","to":"CMPUT 304"}
]}

/>
    </div>
    
  );
}
