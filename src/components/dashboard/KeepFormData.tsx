'use client';

import { useEffect } from 'react';

// Las acciones del panel rechazan redirigiendo con ?error= (o resultado=error) y la página vuelve a
// montarse con lo guardado en la base, así que se perdía lo escrito. Al enviar se recuerda en memoria
// (nunca en el navegador) y, si la respuesta es un error, se devuelve al mismo formulario.
// No se recuerdan contraseñas, códigos de un solo uso ni archivos. Un editor con estado propio marca su
// campo oculto con data-keep y escucha 'keep:restore' (ver LessonActivityEditor).

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Value = string | boolean;

const isField = (el: Element): el is Field =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
const isCheck = (el: Field) => el.type === 'checkbox' || el.type === 'radio';

function editable(form: HTMLFormElement) {
  return Array.from(form.elements).filter((el): el is Field => isField(el) && Boolean(el.name)
    && !/^(file|password|submit|button|reset|image)$/.test(el.type)
    && (el.type !== 'hidden' || 'keep' in el.dataset)
    && !/one-time-code|password/.test(el.autocomplete));
}

// Mismo formulario = mismos campos ocultos (ids) y mismos nombres de campo. Los $ACTION_* de React no cuentan.
function identity(form: HTMLFormElement) {
  const hidden = Array.from(form.elements).filter((el): el is HTMLInputElement =>
    el instanceof HTMLInputElement && el.type === 'hidden' && !('keep' in el.dataset) && !el.name.startsWith('$'));
  return JSON.stringify([hidden.map((el) => [el.name, el.value]), editable(form).map((el) => el.name)]);
}

const read = (fields: Field[]): Value[] => fields.map((el) => (isCheck(el) ? (el as HTMLInputElement).checked : el.value));

function put(el: Field, value: Value) {
  if (typeof value === 'boolean') {
    // click() avisa a React como un clic real; un radio se desmarca solo al marcar otro.
    if ((el as HTMLInputElement).checked !== value && (value || el.type === 'checkbox')) el.click();
    return;
  }
  if (el.value === value) return;
  // El setter nativo hace que React note el cambio también en campos controlados.
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set?.call(el, value);
  if (el.type === 'hidden') el.dispatchEvent(new CustomEvent('keep:restore', { bubbles: true, detail: value }));
  else for (const type of ['input', 'change']) el.dispatchEvent(new Event(type, { bubbles: true }));
}

function failed() {
  const query = new URLSearchParams(location.search);
  return query.has('error') || query.get('resultado') === 'error';
}

export function KeepFormData() {
  useEffect(() => {
    let stop = () => {};
    function remember(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !editable(form).length) return;
      stop();
      const key = identity(form), values = read(editable(form)), from = location.href;
      let frame = 0;
      const check = () => {
        frame = 0;
        if (!failed()) {
          if (location.href !== from) stop();
          return;
        }
        // Tras el rechazo, Next monta la página de nuevo; si el formulario sigue siendo el mismo elemento,
        // la acción no redirigió (se guardó y solo refrescó) y no hay nada que devolver.
        const target = Array.from(document.forms).find((f) => f !== form && identity(f) === key);
        if (!target) return;
        editable(target).forEach((el, i) => put(el, values[i]));
        stop();
      };
      const schedule = () => { frame ||= requestAnimationFrame(check); };
      const typed = (e: Event) => { if (e.isTrusted) stop(); };
      const observer = new MutationObserver(schedule);
      // ponytail: tope de 60 s por envío; si una acción tarda más, lo escrito se pierde como antes.
      const timer = window.setTimeout(() => stop(), 60_000);
      observer.observe(document.body, { childList: true, subtree: true });
      document.addEventListener('input', typed, true);
      stop = () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        clearTimeout(timer);
        document.removeEventListener('input', typed, true);
        stop = () => {};
      };
    }
    document.addEventListener('submit', remember, true);
    return () => {
      document.removeEventListener('submit', remember, true);
      stop();
    };
  }, []);
  return null;
}
