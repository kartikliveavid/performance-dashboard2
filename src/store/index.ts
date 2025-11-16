import { reactive } from 'vue';

interface State {
  dataPoints: number[];
}

const state = reactive<State>({
  dataPoints: [],
});

const store = {
  state,
  addDataPoint(dataPoint: number) {
    state.dataPoints.push(dataPoint);
  },
  updateDataPoint(index: number, dataPoint: number) {
    if (index >= 0 && index < state.dataPoints.length) {
      state.dataPoints[index] = dataPoint;
    }
  },
  clearDataPoints() {
    state.dataPoints = [];
  },
};

export default store;