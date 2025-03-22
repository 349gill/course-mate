## CourseMate

A website that allows you to plan your Computing Science degree at the University of Alberta.

<div align="left" style="display: flex; flex-flow: row nowrap; width: 100%;">
  <img src="https://github.com/349gill/course-mate/blob/main/lib/menu.png?raw=true" style="width: 50%; height: auto;">
  <img src="https://github.com/349gill/course-mate/blob/main/lib/result.png?raw=true" style="width: 50%; height: auto;">
</div>

- Input your completed courses list.
- Obtain the remaining requirements for your degree.
- Uses GoJS to illustrate the hierarchy of remaining and completed courses.

## Prerequisites API

The API provides access to a function that finds the prerequisites and corequisites of a given course.  
To use this API, fetch `https://course-mate-rouge.vercel.app/api/` followed by the subject name and course ID, separated by **%20**

Alternatively, encode the course name into a URI before using it in the link.

### Example Usage:

```js
const foo = async (course) => {
  const response = await fetch(
    `https://course-mate-rouge.vercel.app/api/${encodeURIComponent(course)}`
  );
  const page = await response.json();
  return page.courses;
};

console.log(foo("CMPUT 291"));
```

Output:

```json
{
  "corequisites": ["one of CMPUT 201 or 275"],
  "prerequisites": ["CMPUT 175 or 274, and 272"]
}
```
