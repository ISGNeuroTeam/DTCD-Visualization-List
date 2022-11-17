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

  #id;
  #guid;
  #logSystem;
  #eventSystem;
  #storageSystem;
  #dataSourceSystem;
  #dataSourceSystemGUID;
  #vueComponent;

  #config = {
    ...this.defaultConfig,
    colTitle: 'title',
    colSubTitle: 'subTitle',
    colColor: 'color',
    colBackColor: 'backColor',
    colIsColoredTitle: 'isColoredTitle',
    dataSource: '',
    isMarkedItems: false,
  };

  static getRegistrationMeta() {
    return pluginMeta;
  }

  constructor(guid, selector) {
    super();

    const eventSystem = new EventSystemAdapter('0.4.0', guid);
    const storageSystem = new StorageSystemAdapter('0.5.0');

    eventSystem.registerPluginInstance(this, ['Clicked']);

    this.#guid = guid;
    this.#id = `${pluginMeta.name}[${guid}]`;
    this.#logSystem = new LogSystemAdapter('0.5.0', guid, pluginMeta.name);
    this.#eventSystem = eventSystem;
    this.#storageSystem = storageSystem;
    this.#dataSourceSystem = new DataSourceSystemAdapter('0.2.0');

    this.#dataSourceSystemGUID = this.getGUID(
      this.getSystem('DataSourceSystem', '0.2.0')
    );

    const { default: VueJS } = this.getDependence('Vue');

    const view = new VueJS({
      data: () => ({ guid, eventSystem, storageSystem }),
      render: h => h(PluginComponent),
    }).$mount(selector);

    this.#vueComponent = view.$children[0];
    this.#logSystem.debug(`${this.#id} initialization complete`);
    this.#logSystem.info(`${this.#id} initialization complete`);
  }

  setVueComponentPropValue(prop, value) {
    const methodName = `set${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
    if (this.#vueComponent[methodName]) {
      this.#vueComponent[methodName](value)
    } else {
      throw new Error(`В компоненте отсутствует метод ${methodName} для присвоения свойства ${prop}`)
    }
  }

  setPluginConfig(config = {}) {
    this.#logSystem.debug(`Set new config to ${this.#id}`);
    this.#logSystem.info(`Set new config to ${this.#id}`);

    const configProps = Object.keys(this.#config);

    for (const [prop, value] of Object.entries(config)) {
      if (!configProps.includes(prop)) continue;

      if (prop !== 'dataSource') {
        this.setVueComponentPropValue(prop, value)
      } else if (value) {
        if (this.#config[prop]) {
          this.#logSystem.debug(
              `Unsubscribing ${this.#id} from DataSourceStatusUpdate({ dataSource: ${this.#config[prop]}, status: success })`
          );
          this.#eventSystem.unsubscribe(
              this.#dataSourceSystemGUID,
              'DataSourceStatusUpdate',
              this.#guid,
              'processDataSourceEvent',
              { dataSource: this.#config[prop], status: 'success' },
          );
        }

        const dsNewName = value;

        this.#logSystem.debug(
            `Subscribing ${this.#id} for DataSourceStatusUpdate({ dataSource: ${dsNewName}, status: success })`
        );

        this.#eventSystem.subscribe(
            this.#dataSourceSystemGUID,
            'DataSourceStatusUpdate',
            this.#guid,
            'processDataSourceEvent',
            { dataSource: dsNewName, status: 'success' },
        );

        const ds = this.#dataSourceSystem.getDataSource(dsNewName);

        if (ds && ds.status === 'success') {
          const data = this.#storageSystem.session.getRecord(dsNewName);
          this.loadData(data);
        }
      }

      this.#config[prop] = value;
      this.#logSystem.debug(`${this.#id} config prop value "${prop}" set to "${value}"`);
    }
  }

  getPluginConfig() {
    return { ...this.#config };
  }

  loadData(data) {
    this.#vueComponent.setDataset(data);
  }

  processDataSourceEvent(eventData) {
    const { dataSource, status } = eventData;
    const data = this.#storageSystem.session.getRecord(dataSource);
    this.#logSystem.debug(
      `${this.#id} process DataSourceStatusUpdate({ dataSource: ${dataSource}, status: ${status} })`
    );
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
          component: 'divider',
        },
        ...this.defaultFields,
        {
          component: 'divider',
        },
        {
          component: 'text',
          propName: 'colTitle',
          attrs: {
            label: 'Имя колонки с основным заголовком',
          },
        },
        {
          component: 'text',
          propName: 'colSubTitle',
          attrs: {
            label: 'Имя колонки с подзаголовком',
          },
        },
        {
          component: 'text',
          propName: 'colIsColoredTitle',
          attrs: {
            label: 'Имя колонки с флагом окраски заголовка',
            title: 'Чтобы цвет применился, значение этой колонки должно быть или `true` или `1`.',
          },
        },
        {
          component: 'text',
          propName: 'colColor',
          attrs: {
            label: 'Имя колонки с цветом заголовка',
          },
        },
        {
          component: 'text',
          propName: 'colBackColor',
          attrs: {
            label: 'Имя колонки с цветом фона',
          },
        },
        {
          component: 'divider',
        },
        {
          component: 'checkbox',
          propName: 'isMarkedItems',
          attrs: {
            label: 'Включить маркировку списка'
          },
        },
      ],
    };
  }

  getState() {
    return Object.assign(
      this.getPluginConfig(),
      { dataset: this.#vueComponent.dataset },
    );
  }

  setState(newState) {
    if (typeof newState !== 'object' ) return;

    this.setPluginConfig(newState);

    const vueNamesFields = [
      'dataset',
    ];

    for (const [prop, value] of Object.entries(newState)) {
      if (!vueNamesFields.includes(prop)) continue;
      this.#vueComponent[prop] = value;
    }
  }
}
