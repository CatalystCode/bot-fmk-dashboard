import * as _ from 'lodash';
import { DataSourceConnector } from '../../data-sources/DataSourceConnector';

interface IDownloadFile {
  filename: string;
  csv: string;
  json: string;
  source: string;
}

export default class DownloadFile implements IDownloadFile {
  filename: string;
  json: string;
  csv: string;
  source: string;

  constructor(filename: string, json: string, csv: string, source: string = '') {
    this.filename = filename;
    this.json = json;
    this.csv = csv;
    this.source = source;
  }
}

function downloadBlob(data: string, mimeType: string, filename: string) {
  const blob = new Blob([data], {
    type: mimeType
  });
  var el = document.createElement('a');
  el.setAttribute('href', window.URL.createObjectURL(blob));
  el.setAttribute('download', filename);
  el.style.display = 'none';
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
}

function exportDataSources() {
  const sources = DataSourceConnector.getDataSources();
  let states = {};
  Object.keys(sources).forEach(key => {
    let state = sources[key].store.state;
    if (_.isEmpty(state)) {
      return;
    }
    let isEmpty = Object.keys(state).every(prop => {
      if (state[prop] === null || state[prop] === undefined) {
        return true;
      }
      return false;
    });
    if (isEmpty) {
      return;
    }
    states[key] = state;
  });
  return states;
}

function createDownloadFiles(json: any) {
  let files: IDownloadFile[] = [];
  if (Array.isArray(json)) {
    let csv = arrayToFileData(json, 'data', true);
    return [csv];
  }
  if (typeof json === 'object') {
    return objectArraysToFiles(json, files);
  }
  return [];
}

function objectArraysToFiles(obj: any, container: IDownloadFile[], sourceName: string = '') {
  if (obj === null || obj === undefined) {
    return container;
  }
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (Array.isArray(value) && value.length > 0) {
      const csv = arrayToFileData(value, key, true, sourceName);
      container.push(csv);
    } else if (typeof value === 'object') {
      objectArraysToFiles(value, container, key);
    }
  });
  return container;
}

function arrayToFileData(arr: any[], title: string, useColumnNames: boolean = true, source: string = '') {
  let rows = [];
  let keys = Object.keys(arr[0]);
  let columnNames = (keys).join(',');

  if (typeof arr[0] === 'object') {

    const collection = arr.reduce((a, c) => {
      let values = [];
      Object.keys(c).forEach(key => {
        const i = keys.findIndex(k => k === key);
        const value = typeof c[key] === 'object' ? JSON.stringify(c[key]) : c[key];
        if (i > -1) {
          values[i] = escapeValue(value);
        } else {
          keys.push(key);
          values[keys.length - 1] = escapeValue(value);
        }
      });
      a.push(values.join(','));
      return a;
    },                            []);
    rows.push(collection.join('\n'));
    columnNames = (keys).join(',');
  } else {
    rows.push(arr.join('\n')); // single value string array
    columnNames = title;
  }

  if (useColumnNames) {
    rows.unshift(columnNames);
  }

  return new DownloadFile(title, stripSlashes(JSON.stringify(arr)), rows.join('\n'), source);
}

function escapeValue(value: string) {
  if (typeof value === 'string' && value.indexOf(',') > -1) {
    return (value.indexOf('"') === -1) ? `"${value}"` : '"' + stripSlashes(value.replace(/"/g, '""')) + '"';
  }
  return value;
}

function stripSlashes(value: string) {
  return value.replace(/\\\\/g, '\\');
}

export { exportDataSources, createDownloadFiles, downloadBlob };