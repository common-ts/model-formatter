export enum FormatType {
  Currency = 'Currency',
  Percentage = 'Percentage',

  Email = 'Email',
  Url = 'Url',
  Phone = 'Phone',
  Fax = 'Fax',

  IPv4 = 'IPv4',
  IPv6 = 'IPv6',
}

export interface Metadata {
  name: string;
  attributes: any;
  source?: string;
  model?: any;
  schema?: any;
}

export interface MetaModel {
  model: Metadata;
  attributeName?: string;
  dateFields?: string[];
  integerFields?: string[];
  numberFields?: string[];
  currencyFields?: string[];
  phoneFields?: string[];
  faxFields?: string[];
  objectFields?: MetaModel[];
  arrayFields?: MetaModel[];
}

export interface Attribute {
  formatType?: FormatType;
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
class f {
  private static _preg = / |\-|\.|\(|\)/g;
  private static _datereg = '/Date(';
  private static _re = /-?\d+/;
  private static _r1 = / |,|\$|€|£|¥|'|٬|،| /g;
  private static _r2 = / |\.|\$|€|£|¥|'|٬|،| /g;
  static getCurrency: (currencyCode: string) => Currency = null;
  static formatNumber: (value: number, scale: number, locale: Locale) => string = null;
  static formatPhone: (phone: string) => string = null;
  static formatFax: (fax: string) => string = null;

  static removePhoneFormat(phone: string): string {
    if (phone) {
      return phone.replace(f._preg, '');
    }
    return phone;
  }
  static removeFaxFormat(fax: string): string {
    if (fax) {
      return fax.replace(f._preg, '');
    }
    return fax;
  }

  private static jsonToDate(obj, fields: string[]) {
    if (!obj || !fields) {
      return obj;
    }
    if (!Array.isArray(obj)) {
      for (const field of fields) {
        const val = obj[field];
        if (val && !(val instanceof Date)) {
          obj[field] = f.convertJsonToDate(val);
        }
      }
    }
  }
  private static convertJsonToDate(dateStr): Date {
    if (!dateStr || dateStr === '') {
      return null;
    }
    const i = dateStr.indexOf(f._datereg);
    if (i >= 0) {
      const m = f._re.exec(dateStr);
      const d = parseInt(m[0], null);
      return new Date(d);
    } else {
      if (isNaN(dateStr)) {
        return new Date(dateStr);
      } else {
        const d = parseInt(dateStr, null);
        return new Date(d);
      }
    }
  }

  static json<T>(obj: T, m: MetaModel, loc: Locale, cur?: string) {
    f.jsonToDate(obj, m.dateFields);
    if (f.removePhoneFormat && m.phoneFields && m.phoneFields.length > 0) {
      for (const p of m.phoneFields) {
        const v = obj[p];
        if (v) {
          obj[p] = f.removePhoneFormat(v);
        }
      }
    }
    if (f.removeFaxFormat && m.faxFields && m.faxFields.length > 0) {
      for (const p of m.faxFields) {
        const v = obj[p];
        if (v) {
          obj[p] = f.removeFaxFormat(v);
        }
      }
    }
    const r1 = f._r1;
    const r2 = f._r2;
    if (m.integerFields) {
      if (loc && loc.decimalSeparator !== '.') {
        for (const p of m.integerFields) {
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
        for (const p of m.integerFields) {
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
    if (m.numberFields) {
      if (loc && loc.decimalSeparator !== '.') {
        for (const p of m.numberFields) {
          let v = obj[p];
          if (v) {
            v = '' + v;
            v = v.replace(r2, '');
            if (v.indexOf(loc.decimalSeparator) >= 0) {
              v = v.replace(loc.decimalSeparator, '.');
            }
            if (v.indexOf('%') >= 0) {
              const attr: Attribute = m.model.attributes[p];
              if (attr.formatType === FormatType.Percentage) {
                v = v.replace('%', '');
              }
            }
            if (!isNaN(v)) {
              obj[p] = parseFloat(v);
            }
          }
        }
      } else {
        for (const p of m.numberFields) {
          let v = obj[p];
          if (v) {
            v = '' + v;
            v = v.replace(r1, '');
            if (v.indexOf('%') >= 0) {
              const attr: Attribute = m.model.attributes[p];
              if (attr.formatType === FormatType.Percentage) {
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
    if (m.currencyFields) {
      if (cur) {
        cur = cur.toUpperCase();
      }
      if (loc && loc.decimalSeparator !== '.') {
        for (const p of m.currencyFields) {
          let v = obj[p];
          if (v) {
            v = '' + v;
            if (f.getCurrency && cur) {
              const currency = f.getCurrency(cur);
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
        for (const p of m.currencyFields) {
          let v = obj[p];
          if (v) {
            v = '' + v;
            v = v.replace(r1, '');
            if (f.getCurrency && cur) {
              const currency = f.getCurrency(cur);
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
    if (m.objectFields) {
      for (const objectField of m.objectFields) {
        if (obj[objectField.attributeName]) {
          f.json(obj[objectField.attributeName], objectField, loc, cur);
        }
      }
    }
    if (m.arrayFields) {
      for (const arrayField of m.arrayFields) {
        if (obj[arrayField.attributeName]) {
          const arr = obj[arrayField.attributeName];
          if (Array.isArray(arr)) {
            for (const a of arr) {
              f.json(a, arrayField, loc, cur);
            }
          }
        }
      }
    }
  }

  static format<T>(obj: T, m: MetaModel, loc: Locale, cur?: string, includingCurrencySymbol: boolean = false) {
    if (f.formatPhone && m.phoneFields) {
      for (const p of m.phoneFields) {
        const v = obj[p];
        if (v) {
          obj[p] = f.formatPhone(v);
        }
      }
    }
    if (f.formatFax && m.faxFields) {
      for (const p of m.faxFields) {
        const v = obj[p];
        if (v) {
          obj[p] = f.formatFax(v);
        }
      }
    }
    if (f.formatNumber) {
      if (m.integerFields) {
        for (const p of m.integerFields) {
          const v = obj[p];
          if (v && !isNaN(v)) {
            const attr: Attribute = m.model.attributes[p];
            if (attr && !attr.noformat) {
              obj[p] = f.formatNumber(v, attr.scale, loc);
            }
          }
        }
      }
      if (m.numberFields) {
        for (const p of m.numberFields) {
          const v = obj[p];
          if (v && !isNaN(v)) {
            const attr: Attribute = m.model.attributes[p];
            if (attr && !attr.noformat) {
              let z = f.formatNumber(v, attr.scale, loc);
              if (attr.formatType === FormatType.Percentage) {
                z = z + '%';
              }
              obj[p] = z;
            }
          }
        }
      }
      if (m.currencyFields) {
        for (const p of m.currencyFields) {
          const v = obj[p];
          if (v && !isNaN(v)) {
            const attr: Attribute = m.model.attributes[p];
            if (attr && !attr.noformat && (cur || attr.scale)) {
              let scale = attr.scale;
              let currency;
              if (f.getCurrency && cur) {
                currency = f.getCurrency(cur);
                if (currency) {
                  scale = currency.decimalDigits;
                }
              }
              if (scale && currency) {
                let v2 = f.formatNumber(v, scale, loc);
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
    if (m.objectFields && m.objectFields.length > 0) {
      for (const p of m.objectFields) {
        const v = obj[p.attributeName];
        if (v) {
          f.format(v, p, loc, cur, includingCurrencySymbol);
        }
      }
    }
    if (m.arrayFields) {
      for (const p of m.arrayFields) {
        const arr = obj[p.attributeName];
        if (arr && Array.isArray(arr)) {
          for (const a of arr) {
            f.format(a, p, loc, cur, includingCurrencySymbol);
          }
        }
      }
    }
  }
}

export const formatter = f;
