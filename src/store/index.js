import Vue from 'vue';
// import Vuex from 'vuex';


import Vuex from './vuex';

Vue.use(Vuex);

const test = {
  namespaced:  true,
  state: {
    testNum: 9
  },
  mutations: {
    changeTest(state) {
      state.testNum = 99;
    }
  }
};

const commander = {
  namespaced: true,
  modules: {
    test
  },
  state: {
    num: 17
  },
  mutations: {
    fire(state) {
      state.num -= 1
    }
  },
  getters: {
    fireCount(state) {
      return (17-state.num) * 100
    },
    totalCount(state, getters, rootState) {
      return getters.fireCount + rootState.count * 2
    }
  },
  actions: {
    fireAsync({commit}) {
      setTimeout(() => {
        commit('fire');
      }, 2000);
    }
  }
};

export default new Vuex.Store({
  modules: {
    commander
  },
  state: {
    count: 1
  },
  getters: {
    killCount(state) {
      return state.count * 2;
    }
  },
  mutations: {
    increment(state, n = 1) {
      state.count += n;
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment', 2);
      }, 1000);
    }
  }
})
