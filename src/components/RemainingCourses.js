import React, { useState, useEffect } from "react";

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

export default RemainingCourses;
