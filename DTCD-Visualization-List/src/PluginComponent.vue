<template>
  <div v-if="dataset.length < 1" class="VisualizationList NoData">
    <span class="FontIcon name_infoCircleOutline Icon"></span>
    Нет данных для отображения
  </div>
  <div v-else class="VisualizationList">
    <div v-if="config.title" class="VisualizationList__title">
      {{ config.title }}
    </div>
    <div class="VisualizationList__container">
      <div
          v-for="(item, index) in dataset"
          :key="`item-${index}`"
          class="list-item"
          :class="{ selected: index === selectedItem }"
          :style="{ backgroundColor: item[config.colBackColor] }"
          @click="clickListItem(item, index)"
      >
        <div v-if="config.isMarkedItems" class="item-icon">
        <span
            class="FontIcon name_dot Marker"
            :style="{ color: getFromItem(item, config.colColor) }"
        />
        </div>
        <div class="item-content">
        <span
            class="main-text"
            :style="{
            color: isTrueOrFalse(item[config.colIsColoredTitle]) ? getFromItem(item, config.colColor) : '',
          }"
            v-text="item[config.colTitle]"
        />
          <span class="sub-text" v-text="getFromItem(item, config.colSubTitle)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PluginComponent',
  data: self => ({
    eventSystem: self.$root.eventSystem,
    storageSystem: self.$root.storageSystem,
    tokenName: '',
    selectedItem: null,
    dataset: [],
    config: {
      title: '',
      colTitle: 'title',
      colSubTitle: 'subTitle',
      colColor: 'color',
      colBackColor: 'backColor',
      colIsColoredTitle: 'isColoredTitle',
      isMarkedItems: false,
    },
  }),
  methods: {
    setTitle(value = '') {
      this.config.title = value;
    },
    setColTitle(value = '') {
      this.config.colTitle = value;
    },
    setColSubTitle(value = '') {
      this.config.colSubTitle = value;
    },
    setColColor(value = '') {
      this.config.colColor = value;
    },
    setColBackColor(value = '') {
      this.config.colBackColor = value;
    },
    setColIsColoredTitle(value = '') {
      this.config.colIsColoredTitle = value;
    },
    setIsMarkedItems(value = '') {
      this.config.isMarkedItems = value;
    },
    setConfigProp(prop, value) {
      this.config[prop] = value;
    },

    getFromItem(item, key) {
      return item[key];
    },

    setDataset(data = []) {
      this.selectedItem = null;
      this.dataset = data;
    },

    clickListItem(item, itenIndex) {
      this.selectedItem = itenIndex;
      this.eventSystem.publishEvent('Clicked', item);
    },

    isTrueOrFalse(value = '') {
      switch (value) {
        case 'true':
        case '1':
        case 1:
        case true:
          return true;
      }
      return false;
    }
  },
};
</script>

<style lang="sass">
$border: 2px solid var(--background_secondary)

.VisualizationList
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  overflow-y: auto
  color: var(--text_secondary)
  font-family: 'Proxima Nova', sans-serif

  &__title
    font-weight: 600
    font-size: 15px
    line-height: 18px
    padding: 10px

  &__container
    width: 100%
    height: 100%
    display: flex
    flex-direction: column
    overflow-y: auto

  &.NoData
    align-items: center
    justify-content: center

    .Icon
      color: var(--border_secondary)
      font-size: 100px
      margin-bottom: 8px

  .list-item
    flex: 1 0
    display: flex

    &:not(:first-child)
      border-top: $border

    &:not(:last-child)
      border-bottom: $border

    &.selected
      outline: 2px solid var(--button_primary)
      outline-offset: -2px

    .item-icon
      padding: 12px 16px
      padding-right: 0

      .Marker
        color: var(--text_main)
        font-size: 40px
        margin-top: -10px
        margin-left: -12px

    .item-content
      padding: 12px 16px

      .main-text
        font-size: 15px
        font-weight: 600
        line-height: 18px

      .sub-text
        color: var(--text_secondary)
        font-size: 11px
        font-weight: 400
        line-height: 18px

</style>
