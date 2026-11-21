// Un slug de curso nunca puede convertirse en una redirección a otro sitio.
export function loginCourse(value: unknown): string {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 160 ? value : '';
}

export function courseLoginQuery(value: unknown): string {
  const course = loginCourse(value);
  return course ? `&curso=${encodeURIComponent(course)}` : '';
}
