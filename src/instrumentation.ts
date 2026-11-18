// Cualquier error del servidor (páginas, acciones y rutas) avisa por correo, con tope de uno por ruta cada hora.
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routeType: string; routePath: string },
) {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return;
  // Las redirecciones y los 404 de Next llegan como errores con digest propio; no son fallas.
  const digest = (error as { digest?: string } | null)?.digest || '';
  if (digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_HTTP_ERROR_FALLBACK') || digest === 'NEXT_NOT_FOUND') return;
  const { alertTeam } = await import('@/lib/valux/alerts');
  await alertTeam(`error en ${context.routePath || request.path}`, error instanceof Error ? error : JSON.stringify(error));
}
