import React, { useState } from "react";

const DegreeForm = ({ setDegree, setCourses, handleSubmit, errorMessage }) => {
  const [localDegree, setLocalDegree] = useState("");
  const [localCourses, setLocalCourses] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(localDegree, localCourses);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 max-w-lg mx-auto">
      <div className="relative">
        <select
          value={localDegree}
          onChange={(e) => setLocalDegree(e.target.value)}
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
          value={localCourses}
          onChange={(e) => setLocalCourses(e.target.value)}
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
  );
};

export default DegreeForm;
