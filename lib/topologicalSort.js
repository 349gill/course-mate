export default function topologicalSort(courses) {
  const adj = {};
  const inDegree = {};
  const allCourses = new Set();

  for (const [course, prerequisites] of Object.entries(courses)) {
    allCourses.add(course);
    if (!adj[course]) adj[course] = [];
    if (inDegree[course] === undefined) inDegree[course] = 0;

    for (const prereq of new Set(prerequisites)) {
      allCourses.add(prereq);
      if (!adj[prereq]) adj[prereq] = [];
      if (!adj[prereq].includes(course)) adj[prereq].push(course);
      inDegree[course] = (inDegree[course] || 0) + 1;
      if (inDegree[prereq] === undefined) inDegree[prereq] = 0;
    }
  }

  const queue = [];
  for (const course of allCourses) {
    if (!inDegree[course]) {
      queue.push(course);
    }
  }

  const order = [];
  while (queue.length > 0) {
    const curr = queue.shift();
    order.push(curr);

    const neighbors = adj[curr] || [];
    for (const neighbor of neighbors) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length !== allCourses.size) {
    for (const course of allCourses) {
      if (!order.includes(course)) {
        order.push(course);
      }
    }
  }

  return order;
}
