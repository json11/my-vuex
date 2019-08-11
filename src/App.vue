<template>
  <div id="app">
    <div>冲啊，手榴弹扔了{{$store.state.count}}个</div>
    <div>炸死了{{$store.getters.killCount}}个柜子</div>

    <div>测试{{$store.state.commander.num}}</div>
    <button @click="add">扔一个</button>
    <button @click="addAsync">蓄力扔俩</button>

    <br>
    <div>test---{{count}}</div>
    <button @click="add">test-----扔</button>

    <br>
    <Child></Child>
  </div>
</template>
<script>
  // import {mapState} from 'vuex';
  import {mapState, mapMutations} from './store/vuex';
  import Child from './components/Child';

  export default {
    name: 'app',
    components: {
      Child
    },
    computed: {
      ...mapState({
        count: state => state.commander.num,
        countAlias: 'count',
        countPlusLocalState(state) {
          return state.count
        }
      })
    },
    created() {
      console.log(this.$store);
    },
    methods: {
      ...mapMutations(['add']),
      // add(){
      //   this.$store.commit('increment')
      // },
      addAsync() {
        this.$store.dispatch('incrementAsync')
      }
    }
  }
</script>
