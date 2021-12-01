import pluginMeta from './Plugin.Meta';
import PluginComponent from './PluginComponent.vue';

import {
  PanelPlugin,
  LogSystemAdapter,
  EventSystemAdapter,
  StorageSystemAdapter,
} from './../../DTCD-SDK';

export class VisualizationList extends PanelPlugin {
  #isMarkedItems;
  #colColor;
  #colBackColor;
  #colTitle;
  #colSubTitle;
  #colIsColoredTitle;
  #dataSourceName;
  // #tokenName;
  #storageSystem;
  #guid;
  #eventSystem;
  #dataSourceSystemGUID;

  static getRegistrationMeta() {
    return pluginMeta;
  }

  constructor(guid, selector) {
    super();

    const logSystem = new LogSystemAdapter(guid, pluginMeta.name);
    const eventSystem = new EventSystemAdapter(guid);
    const storageSystem = new StorageSystemAdapter();

    eventSystem.registerPluginInstance(this);
    this.#storageSystem = storageSystem;

    this.#guid = guid;
    this.#eventSystem = eventSystem;

    const { default: VueJS } = this.getDependence('Vue');

    const view = new VueJS({
      data: () => ({ guid, logSystem, eventSystem, storageSystem }),
      render: h => h(PluginComponent),
    }).$mount(selector);

    this.#dataSourceSystemGUID = this.getGUID(this.getSystem('DataSourceSystem'));

    this.vueComponent = view.$children[0];
    this.#isMarkedItems = false;
    this.#colColor = 'color';
    this.#colBackColor = 'backColor';
    this.#colTitle = 'title';
    this.#colSubTitle = 'subTitle';
    this.#colIsColoredTitle = 'coloredTitle';
    this.#dataSourceName = '';
    // this.#tokenName = '';
  }

  setPluginConfig(config = {}) {
    const {
      isMarkedItems,
      colColor,
      colBackColor,
      colTitle,
      colSubTitle,
      colIsColoredTitle,
      dataSource,
      // tokenName,
    } = config;

    if (typeof isMarkedItems !== 'undefined') {
      this.#isMarkedItems = isMarkedItems;
      this.vueComponent.setConfig('isMarkedItems', isMarkedItems);
    }

    if (typeof colIsColoredTitle !== 'undefined') {
      this.#colIsColoredTitle = colIsColoredTitle;
      this.vueComponent.setConfig('colIsColoredTitle', colIsColoredTitle);
    }

    if (typeof colColor === 'string') {
      this.#colColor = colColor;
      this.vueComponent.setConfig('colColor', colColor);
    }

    if (typeof colBackColor === 'string') {
      this.#colBackColor = colBackColor;
      this.vueComponent.setConfig('colBackColor', colBackColor);
    }

    if (typeof colTitle === 'string') {
      this.#colTitle = colTitle;
      this.vueComponent.setConfig('colTitle', colTitle);
    }

    if (typeof colSubTitle === 'string') {
      this.#colSubTitle = colSubTitle;
      this.vueComponent.setConfig('colSubTitle', colSubTitle);
    }

    if (dataSource !== '' && typeof dataSource !== 'undefined') {
      if (this.#dataSourceName) {
        this.#eventSystem.unsubscribe(
          this.#dataSourceSystemGUID,
          'DataSourceStatusUpdate',
          this.#guid,
          'processDataSourceEvent',
          { dataSource: this.#dataSourceName, status: 'success' }
        );
      }

      this.#dataSourceName = dataSource;

      this.#eventSystem.subscribe(
        this.#dataSourceSystemGUID,
        'DataSourceStatusUpdate',
        this.#guid,
        'processDataSourceEvent',
        { dataSource, status: 'success' }
      );

      const DS = this.getSystem('DataSourceSystem').getDataSource(this.#dataSourceName);
      if (DS.status === 'success') {
        const data = this.#storageSystem.session.getRecord(this.#dataSourceName);
        this.loadData(data);
      }
    }

    // if (typeof tokenName === 'string') {
    //   this.#tokenName = tokenName;
    //   this.vueComponent.setConfig('tokenName', tokenName);
    // }
  }

  getPluginConfig() {
    const config = {};
    if (typeof this.#isMarkedItems !== 'undefined') config.isMarkedItems = this.#isMarkedItems;
    if (typeof this.#colIsColoredTitle !== 'undefined')
      config.colIsColoredTitle = this.#colIsColoredTitle;
    if (typeof this.#colColor !== 'undefined') config.colColor = this.#colColor;
    if (typeof this.#colBackColor !== 'undefined') config.colBackColor = this.#colBackColor;
    if (typeof this.#colTitle !== 'undefined') config.colTitle = this.#colTitle;
    if (typeof this.#colSubTitle !== 'undefined') config.colSubTitle = this.#colSubTitle;
    if (typeof this.#dataSourceName !== 'undefined') config.dataSource = this.#dataSourceName;
    // if (typeof this.#tokenName !== 'undefined') config.tokenName = this.#tokenName;
    return config;
  }

  loadData(data) {
    this.vueComponent.setDataset(data);
  }

  processDataSourceEvent(eventData) {
    const { dataSource, status } = eventData;
    this.#dataSourceName = dataSource;
    const data = this.#storageSystem.session.getRecord(this.#dataSourceName);
    this.loadData(data);
  }

  setFormSettings() {}

  getFormSettings() {}
}
