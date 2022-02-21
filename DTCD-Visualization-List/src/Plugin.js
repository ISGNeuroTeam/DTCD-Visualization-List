import pluginMeta from './Plugin.Meta';
import PluginComponent from './PluginComponent.vue';

import {
  PanelPlugin,
  LogSystemAdapter,
  EventSystemAdapter,
  StorageSystemAdapter,
  DataSourceSystemAdapter,
} from './../../DTCD-SDK';

export class VisualizationList extends PanelPlugin {

  #isMarkedItems;
  #colColor;
  #colBackColor;
  #colTitle;
  #colSubTitle;
  #colIsColoredTitle;
  #dataSourceName;
  #dataSourceSystem;
  #dataSourceSystemGUID;
  #storageSystem;
  #guid;
  #eventSystem;

  static getRegistrationMeta() {
    return pluginMeta;
  }

  constructor(guid, selector) {
    super();

    const logSystem = new LogSystemAdapter('0.5.0', guid, pluginMeta.name);
    const eventSystem = new EventSystemAdapter('0.4.0', guid);
    const storageSystem = new StorageSystemAdapter('0.5.0');

    eventSystem.registerPluginInstance(this);
    this.#guid = guid;
    this.#eventSystem = eventSystem;
    this.#storageSystem = storageSystem;
    this.#dataSourceSystem = new DataSourceSystemAdapter('0.2.0');

    this.#dataSourceSystemGUID = this.getGUID(
      this.getSystem('DataSourceSystem', '0.2.0')
    );

    const { default: VueJS } = this.getDependence('Vue');

    const view = new VueJS({
      data: () => ({ guid, logSystem, eventSystem, storageSystem }),
      render: h => h(PluginComponent),
    }).$mount(selector);

    this.vueComponent = view.$children[0];
    this.#isMarkedItems = false;
    this.#colColor = 'color';
    this.#colBackColor = 'backColor';
    this.#colTitle = 'title';
    this.#colSubTitle = 'subTitle';
    this.#colIsColoredTitle = 'coloredTitle';
    this.#dataSourceName = '';
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

      const DS = this.#dataSourceSystem.getDataSource(this.#dataSourceName);

      if (DS.status === 'success') {
        const data = this.#storageSystem.session.getRecord(this.#dataSourceName);
        this.loadData(data);
      }
    }
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

  setFormSettings(config) {
    return this.setPluginConfig(config);
  }

  getFormSettings() {
    return {
      fields: [
        {
          component: 'title',
          propValue: 'Общие настройки',
        },
        {
          component: 'title',
          propValue: 'Источник данных',
        },
        {
          component: 'datasource',
          propName: 'dataSource',
          attrs: {
            label: 'Выберите источник данных',
            placeholder: 'Выберите значение',
            required: true,
          },
        },
        {
          component: 'text',
          propName: 'colTitle',
          attrs: {
            label: 'Имя колонки с основным заголовком',
            propValue: 'title',
            required: true,
          },
        },
        {
          component: 'text',
          propName: 'colSubTitle',
          attrs: {
            label: 'Имя колонки с подзаголовком',
            propValue: 'subTitle',
            required: true,
          },
        },
        {
          component: 'text',
          propName: 'colIsColoredTitle',
          attrs: {
            label: 'Имя колонки с флагом окраски заголовка',
            propValue: 'coloredTitle',
            required: true,
          },
        },
        {
          component: 'text',
          propName: 'colColor',
          attrs: {
            label: 'Имя колонки с цветом заголовка',
            propValue: 'color',
            required: true,
          },
        },
        {
          component: 'text',
          propName: 'colBackColor',
          attrs: {
            label: 'Имя колонки с цветом фона',
            propValue: 'backColor',
            required: true,
          },
        },
        {
          component: 'checkbox',
          propName: 'isMarkedItems',
          attrs: { label: 'Включить маркировку списка' },
        },
      ],
    };
  }

}
