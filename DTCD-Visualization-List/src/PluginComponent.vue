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
      <div v-show="isMarkedItems" class="item-icon">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="6" :fill="getFromItem(item, colColor) || '#51515C'" />
        </svg>
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
@import ./styles/component
</style>
