import {EventEmitter} from "events";
import lazy from "lazy.js";

const AbstractIdStore = () => lazy(EventEmitter.prototype).extend({

  _data: {},
  _all: {
    loading: false,
    error: false
  },

  getItem: function (id) {
    return this._data[id] || this.defaultItem();
  },

  defaultItemValue: null,

  defaultItem: function () {
    return {
      data: this.defaultItemValue,
      loading: false,
      error: false,
      updating: false,
      creating: false,
      deleting: false
    };
  },

  get: function (id) {
    return this.getItem(id);
  },

  getAll: function () {
    return {
      loading: this._all.loading,
      error: this._all.error,
      data: this._data
    };
  },

  deleteAll: function () {
    this._data = {};
    this.emit("change");
  },

  onRequest: function (action) {
    let item = this.getItem(action.id);
    item.loading = true;
    if (action.data) {
      item.data = action.data;
    }
    this._data[action.id] = item;
    this.emit("change", action.id);
  },

  onRequestSuccess: function (action) {
    let item = this.getItem(action.id);
    item.loading = false;
    item.error = false;
    item.data = action.data;
    this._data[action.id] = item;
    this.emit("change", action.id);
  },

  onRequestError: function (action) {
    let item = this.getItem(action.id);
    item.loading = false;
    item.error = action.error || true;
    this._data[action.id] = item;
    this.emit("change", action.id);
  },

  onRequestCreate: function (action) {
    let item = this.get(action.temporaryId);
    item.data = action.data;
    item.creating = true;
    this._data[action.temporaryId] = item;
    this.emit("change", action.temporaryId);
  },

  onRequestCreateSuccess: function (action) {
    let item = this.get(action.temporaryId);
    item.data = action.data;
    item.creating = false;
    item.error = false;
    this._data[action.id] = item;
    delete this._data[action.temporaryId];
    this.emit("change", action.temporaryId, {id: action.id});
  },

  onRequestCreateError: function (action) {
    delete this._data[action.temporaryId];
    this.emit("change", action.temporaryId);
  },

  onRequestDelete: function (action) {
    let item = this.getItem(action.id);
    item.deleting = true;
    this._data[action.id] = item;
    this.emit("change", action.id);
  },

  onRequestDeleteSuccess: function (action) {
    delete this._data[action.id];
    this.emit("change", action.id);
  },

  onRequestDeleteError: function (action) {
    let item = this.getItem(action.id);
    item.deleting = false;
    item.error = action.error || true;
    this._data[action.id] = item;
    this.emit("change", action.id);
  },

  onRequestAll: function () {
    this._all.loading = true;
    this.emit("change");
  },

  onRequestAllSuccess: function (action) {
    this._all.loading = false;
    this._all.error = false;

    const creating = lazy(this._data)
      .filter(value => value.creating)
      .value();

    const deleting = lazy(this._data)
      .filter(value => value.deleting)
      .map((value, key) => key);

    // Merges the new data with the old data where:
    // - clashing keys get updated
    // - primary keys in old data not found in new data are discarded
    const partial = lazy(action.data)
      .filter((value, key) => !deleting.contains(key))
      .map((value, key) => {
        let item = this.getItem(key);
        item.data = lazy(item.data).merge(value).value();
        item.creating = false;
        return [key, item];
      })
      .toObject();

    this._data = {...creating, ...partial};
    this.emit("change", action.id);

  },

  onRequestAllError: function (action) {
    this._all.loading = false;
    this._all.error = action.error || true;
    this.emit("change");
  },

  onRequestUpdate: function (action) {
    let item = this.getItem(action.id);
    if (action.optimistic) {
      item.oldData = lazy(item.data).merge({}).value();
      item.data = action.data;
    }
    item.updating = true;
    this._data[action.id] = item;
    this.emit("change", action.id);
  },

  onRequestUpdateSuccess: function (action) {
    let item = this.getItem(action.id);
    item.updating = false;
    item.error = false;
    item.data = action.data;
    item.oldData = undefined;
    this._data[action.id] = item;
    this.emit("change", action.id);
  },

  onRequestUpdateError: function (action) {
    let item = this.getItem(action.id);
    item.updating = false;
    item.error = action.error || true;
    if (item.oldData) {
      item.data = item.oldData;
      item.oldData = undefined;
    }
    this._data[action.id] = item;
    this.emit("change", action.id);
  }

}).value();

export default AbstractIdStore;
