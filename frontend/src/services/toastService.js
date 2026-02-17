/**
 * Global toast event bus.
 * Works outside React — Apollo error link and other non-component
 * code can trigger toasts via this service.
 *
 * The ToastProvider subscribes to this service and renders them.
 */

let listeners = [];
let idCounter = 0;

export const toastService = {
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  show(message, type = 'error', duration = 5000) {
    idCounter += 1;
    const toast = { id: idCounter, message, type, duration };
    listeners.forEach((l) => l(toast));
    return toast.id;
  },

  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  error(message, duration) {
    return this.show(message, 'error', duration);
  },

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },

  info(message, duration) {
    return this.show(message, 'info', duration);
  },
};
