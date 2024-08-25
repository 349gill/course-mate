import { useState } from "react";

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
          units += 3; // assuming each course is worth 3 units
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

export default function Home() {
  const [degree, setDegree] = useState("");
  const [courses, setCourses] = useState("");
  const [remainingCourses, setRemainingCourses] = useState([]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const completedCourses = courses.split(",").map((course) => course.trim());

    // Await the result of the getRemainingCourses function
    const remaining = await getRemainingCourses(degree, completedCourses);
    setRemainingCourses(remaining);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800">CourseMate</h1>
        <p className="text-lg text-gray-600">
          Plan your Computer Science degree at the University of Alberta
        </p>
      </header>

      {/* Degree Input Form */}
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
        <div className="mt-8">
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
    </div>
  );
}
