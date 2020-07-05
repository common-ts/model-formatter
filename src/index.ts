export enum Format {
  Currency = 'currency',
  Percentage = 'percentage',

  Email = 'email',
  Url = 'url',
  Phone = 'phone',
  Fax = 'fax',

  IPv4 = 'ipv4',
  IPv6 = 'ipv6',
}

export interface Metadata {
  attributes: any;
}

export interface MetaModel {
  model: Metadata;
  attributeName?: string;
  dates?: string[];
  integers?: string[];
  numbers?: string[];
  currencies?: string[];
  phones?: string[];
  faxes?: string[];
  objects?: MetaModel[];
  arrays?: MetaModel[];
}

export interface Attribute {
  format?: Format;
  scale?: number;
  noformat?: boolean;
}

export interface Currency {
  currencyCode?: string;
  decimalDigits: number;
  currencySymbol: string;
}

export interface Locale {
  id?: string;
  countryCode: string;
  dateFormat: string;
  firstDayOfWeek: number;
  decimalSeparator: string;
  groupSeparator: string;
  decimalDigits: number;
  currencyCode: string;
  currencySymbol: string;
  currencyPattern: number;
  currencySample?: string;
}

// tslint:disable-next-line:class-name
export class resources {
  private static _preg = / |\-|\.|\(|\)/g;
  static format1 = / |,|\$|€|£|¥|'|٬|،| /g;
  static format2 = / |\.|\$|€|£|¥|'|٬|،| /g;
  static getCurrency: (currencyCode: string) => Currency = null;
  static formatNumber: (value: number, scale: number, locale: Locale) => string = null;
  static formatPhone: (phone: string) => string = null;
  static formatFax: (fax: string) => string = null;

  static removePhoneFormat(phone: string): string {
    if (phone) {
      return phone.replace(resources._preg, '');
    }
    return phone;
  }
  static removeFaxFormat(fax: string): string {
    if (fax) {
      return fax.replace(resources._preg, '');
    }
    return fax;
  }

}

const _datereg = '/Date(';
const _re = /-?\d+/;

function toDate(v: any): Date {
  if (!v || v === '') {
    return null;
  }
  if (v instanceof Date) {
    return v;
  } else if (typeof v === 'number') {
    return new Date(v);
  }
  const i = v.indexOf(_datereg);
  if (i >= 0) {
    const m = _re.exec(v);
    const d = parseInt(m[0], null);
    return new Date(d);
  } else {
    if (isNaN(v)) {
      return new Date(v);
    } else {
      const d = parseInt(v, null);
      return new Date(d);
    }
  }
}

function jsonToDate(obj, fields: string[]) {
  if (!obj || !fields) {
    return obj;
  }
  if (!Array.isArray(obj)) {
    for (const field of fields) {
      const val = obj[field];
      if (val && !(val instanceof Date)) {
        obj[field] = toDate(val);
      }
    }
  }
}

export function json<T>(obj: T, m: MetaModel, loc: Locale, cur?: string) {
  jsonToDate(obj, m.dates);
  if (resources.removePhoneFormat && m.phones && m.phones.length > 0) {
    for (const p of m.phones) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.removePhoneFormat(v);
      }
    }
  }
  if (resources.removeFaxFormat && m.faxes && m.faxes.length > 0) {
    for (const p of m.faxes) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.removeFaxFormat(v);
      }
    }
  }
  const r1 = resources.format1;
  const r2 = resources.format2;
  if (m.integers) {
    if (loc && loc.decimalSeparator !== '.') {
      for (const p of m.integers) {
        let v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.integers) {
        let v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r1, '');
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.numbers) {
    if (loc && loc.decimalSeparator !== '.') {
      for (const p of m.numbers) {
        let v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (v.indexOf('%') >= 0) {
            const attr: Attribute = m.model.attributes[p];
            if (attr.format === Format.Percentage) {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.numbers) {
        let v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r1, '');
          if (v.indexOf('%') >= 0) {
            const attr: Attribute = m.model.attributes[p];
            if (attr.format === Format.Percentage) {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.currencies) {
    if (cur) {
      cur = cur.toUpperCase();
    }
    if (loc && loc.decimalSeparator !== '.') {
      for (const p of m.currencies) {
        let v = obj[p];
        if (v) {
          v = '' + v;
          if (resources.getCurrency && cur) {
            const currency = resources.getCurrency(cur);
            if (currency && v.indexOf(currency.currencySymbol) >= 0) {
              v = v.replace(currency.currencySymbol, '');
            }
          }
          if (loc && v.indexOf(loc.currencySymbol) >= 0) {
            v = v.replace(loc.currencySymbol, '');
          }
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.currencies) {
        let v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r1, '');
          if (resources.getCurrency && cur) {
            const currency = resources.getCurrency(cur);
            if (currency && v.indexOf(currency.currencySymbol) >= 0) {
              v = v.replace(currency.currencySymbol, '');
            }
          }
          if (loc && v.indexOf(loc.currencySymbol) >= 0) {
            v = v.replace(loc.currencySymbol, '');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.objects) {
    for (const objectField of m.objects) {
      if (obj[objectField.attributeName]) {
        json(obj[objectField.attributeName], objectField, loc, cur);
      }
    }
  }
  if (m.arrays) {
    for (const arrayField of m.arrays) {
      if (obj[arrayField.attributeName]) {
        const arr = obj[arrayField.attributeName];
        if (Array.isArray(arr)) {
          for (const a of arr) {
            json(a, arrayField, loc, cur);
          }
        }
      }
    }
  }
}

export function format<T>(obj: T, m: MetaModel, loc: Locale, cur?: string, includingCurrencySymbol: boolean = false) {
  if (resources.formatPhone && m.phones) {
    for (const p of m.phones) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.formatPhone(v);
      }
    }
  }
  if (resources.formatFax && m.faxes) {
    for (const p of m.faxes) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.formatFax(v);
      }
    }
  }
  if (resources.formatNumber) {
    if (m.integers) {
      for (const p of m.integers) {
        const v = obj[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.model.attributes[p];
          if (attr && !attr.noformat) {
            obj[p] = resources.formatNumber(v, attr.scale, loc);
          }
        }
      }
    }
    if (m.numbers) {
      for (const p of m.numbers) {
        const v = obj[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.model.attributes[p];
          if (attr && !attr.noformat) {
            let z = resources.formatNumber(v, attr.scale, loc);
            if (attr.format === Format.Percentage) {
              z = z + '%';
            }
            obj[p] = z;
          }
        }
      }
    }
    if (m.currencies) {
      for (const p of m.currencies) {
        const v = obj[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.model.attributes[p];
          if (attr && !attr.noformat && (cur || attr.scale)) {
            let scale = attr.scale;
            let currency;
            if (resources.getCurrency && cur) {
              currency = resources.getCurrency(cur);
              if (currency) {
                scale = currency.decimalDigits;
              }
            }
            if (scale && currency) {
              let v2 = resources.formatNumber(v, scale, loc);
              if (loc && includingCurrencySymbol) {
                const symbol = (loc.currencyCode === cur ? loc.currencySymbol : currency.currencySymbol);
                switch (loc.currencyPattern) {
                  case 0:
                    v2 = symbol + v2;
                    break;
                  case 1:
                    v2 = '' + v2 + symbol;
                    break;
                  case 2:
                    v2 = symbol + ' ' + v2;
                    break;
                  case 3:
                    v2 = '' + v2 + ' ' + symbol;
                    break;
                  default:
                    break;
                }
              }
              obj[p] = v2;
            }
          }
        }
      }
    }
  }
  if (m.objects && m.objects.length > 0) {
    for (const p of m.objects) {
      const v = obj[p.attributeName];
      if (v) {
        format(v, p, loc, cur, includingCurrencySymbol);
      }
    }
  }
  if (m.arrays) {
    for (const p of m.arrays) {
      const arr = obj[p.attributeName];
      if (arr && Array.isArray(arr)) {
        for (const a of arr) {
          format(a, p, loc, cur, includingCurrencySymbol);
        }
      }
    }
  }
}
