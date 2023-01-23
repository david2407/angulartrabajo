declare const window;

export class Utils {
  public static sort = {
    order: {
      desc: (a, b) => b.order - a.order,
      asc: (a, b) => a.order - b.order,
    },
  };

  public static endOfDay(date): Date {
    return new Date(new Date(date).setHours(23, 59, 59, 999));
  }

  public static checkLocalStorage(): boolean {
    const test = 'testLocalStorage';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
    } catch (err) {
      return false;
    }

    return true;
  }

  public static formatEmail(data: any): string {
    let contentEmail = '';
    Object.keys(data).forEach((key) => {
      contentEmail += `<p>${key}: ${data[key]}</p>`;
    });
    return contentEmail;
  }

  public static createEvt(name: string) {
    const iePolyfill = () => {
      if (typeof window.CustomEvent === 'function') {
        return;
      }

      function CustomEvent(event, params) {
        params = params || {
          bubbles: false,
          cancelable: false,
          detail: undefined,
        };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(
          event,
          params.bubbles,
          params.cancelable,
          params.detail
        );
        return evt;
      }

      CustomEvent.prototype = window.Event.prototype;

      window.CustomEvent = CustomEvent;
    };

    iePolyfill();

    const evt = new CustomEvent(name);
    window.dispatchEvent(evt);
  }

  public static getCookie(cname) {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  public static getSectionPermissions(
    roles: string[],
    sectionKey: string,
    stateKey?: string
  ): any {
    return roles
      .filter((r) => r.includes(sectionKey) && r.includes(':'))
      .map((r) => r.replace(sectionKey, '').replace('.', ''))
      .filter((r) => {
        const split = r.split(':').filter((s) => s);
        return (
          !stateKey ||
          (split.length >= 2 && r.includes(stateKey)) ||
          split.length === 1
        );
      })
      .map((r) => (stateKey ? r.replace(stateKey, '').replace(':', '') : r))
      .reduce((previous, key) => {
        previous[key] = true;
        return previous;
      }, {});
  }
}

export const checkIfValidMongoID = (st: string): boolean => {
  return !!st?.trim().match(/^[0-9a-fA-F]{24}$/)?.length;
};
