<template>
  <div class="visualization-list-container">
    <div
      v-for="(item, i) in dataset"
      :key="`item-${i}`"
      class="list-item"
      :class="{ selected: i === selectedItem }"
      :style="{ backgroundColor: item[colBackColor] }"
      @click="clickListItem(item, i)"
    >
      <div v-if="isMarkedItems" class="item-icon">
        <span
          class="FontIcon name_dot Marker"
          :style="{
            color: getFromItem(item, colColor) || 'var(--text_main)'
          }"
        />
      </div>
      <div class="item-content">
        <span
          class="main-text"
          :style="{
            color: getFromItem(item, colIsColoredTitle) ? getFromItem(item, colColor) : '',
          }"
          v-text="item[colTitle]"
        />
        <span class="sub-text" v-text="getFromItem(item, colSubTitle)" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PluginComponent',
  data: self => ({
    logSystem: self.$root.logSystem,
    eventSystem: self.$root.eventSystem,
    storageSystem: self.$root.storageSystem,
    selectedItem: null,
    isMarkedItems: true,
    colColor: 'color',
    colBackColor: 'backColor',
    colTitle: 'title',
    colSubTitle: 'subTitle',
    colIsColoredTitle: 'coloredTitle',
    dataset: [],
    tokenName: '',
  }),
  methods: {
    setConfig(name, value) {
      this[name] = value;
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
      // if (this.tokenName) {
      //   this.storageSystem.tokenStorage.putRecord(
      //     this.tokenName,
      //     item[this.colTitle]
      //   );
      // }
      this.eventSystem.publishEvent('ListItemClicked', item);
    },
  },
};
</script>

<style lang="sass">
$border: 2px solid var(--background_secondary)

.visualization-list-container
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  overflow-y: auto
  font-family: 'Proxima Nova'

  .list-item
    flex: 1 0
    display: flex

    &:not(:first-child)
      border-top: $border

    &:not(:last-child)
      border-bottom: $border

    &.selected
      border: 2px solid var(--button_primary)

    .item-icon
      padding: 12px 16px
      padding-right: 0

      .Marker
        font-size: 40px
        margin-top: -10px
        margin-left: -12px

    .item-content
      padding: 12px 16px

      .main-text
        color: var(--text_main)
        font-size: 15px
        font-weight: 600
        line-height: 18px

      .sub-text
        color: var(--text_secondary)
        font-size: 11px
        font-weight: 400
        line-height: 18px

</style>
