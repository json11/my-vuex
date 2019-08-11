/**
 *  class 内部暴露两个方法
 */
let Vue;

class Store {
  constructor(options = {}) {
    this._vm = new Vue({
      data: {
        state: options.state
      }
    });
    this.mutations = {};
    this.actions = {};
    this.getters = {};
    this.root = null;

    // 注册一下module, 递归， 变成一个大的对象， 挂载到root
    this.register([], options);

    // 安装模块， 目的就是给模块中的state geters mutations actions 做初始化工作
    this.installModules(options.state, [], this.root);
  }

  get state() {
    return this._vm._data.state
  }

  // 由于有可能是异步操作
  commit = (type, arg) => {
    if (!this.mutations[type]) {
      console.log('不合法的mutation');
      return;
    }
    this.mutations[type](this.state, arg);
  }

  dispatch(type, arg) {
    this.actions[type]({
      commit: this.commit,
      state: this.state
    }, arg);
  }

  handleGetters(getters) {
    this.getters = {};
    Object.keys(getters).forEach(key => {
      Object.defineProperty(this.getters, key, {
        get: () => {
          return getters[key](this.state)
        }
      })
    });
  }

  forEachObj(obj = {}, fn) {
    Object.keys(obj).forEach(key => {
      fn(key, obj[key]);
    })
  }

  last(arr) {
    return arr[arr.length - 1];
  }

  /**
   *  注册modules， 建立一个modules 树状
   */
  register(path, module) {
    const newModule = {
      children: {},
      module: module,
      state: module.state
    };
    if (path.length) {
      // 先根据路径获取到父模块，递归往下找，
      const parent = path.slice(0, -1).reduce((module, key) => {
        return module.children[key];
      }, this.root);
      // 然后父子模块建立关联 children
      parent.children[path[path.length - 1]] = newModule;
    } else {
      this.root = newModule;
    }

    if (module.modules) {
      this.forEachObj(module.modules, (name, mod) => {
        this.register([...path, name], mod);
      });
    }
  }

  /**
   *  启动modules 需要重点看下
   */
  installModules(state, path, module) {
    if (path.length > 0) {
      const moduleName = this.last(path);
      Vue.set(state, moduleName, module.state);
    }

    const context = {
      dispatch: this.dispatch,
      commit: this.commit
    };

    Object.defineProperties(context, {
      getters: {
        get: () => this.getters
      },
      state: {
        get: () => {
          let state = this.state;
          return path.length ? path.reduce((state, key) => state[key], state) : state;
        }
      }
    });

    this.registerMutations(module.module.mutations, context);

    this.registerActions(module.module.actions, context);

    this.registerGetters(module.module.getters, context);

    this.forEachObj(module.children, (key, child) => {
      this.installModules(state, [...path, key], child);
    });
  }


  registerMutations(mutations, context) {
    if (mutations) {
      this.forEachObj(mutations, (key, mutation) => {
        this.mutations[key] = () => {
          mutation.call(this, context.state)
        }
      });
    }
  }

  registerActions(actions, context) {
    if (actions) {
      this.forEachObj(actions, (key, action) => {
        this.actions[key] = () => {
          action.call(this, context)
        }
      });
    }
  }

  registerGetters(getters, context) {
    if (getters) {
      this.forEachObj(getters, (key, getter) => {
        Object.defineProperty(this.getters, key, {
          get: () => {
            return getter(context.state, context.getters, this.state);
          }
        })
      });
    }
  }

}


// 只是根据传入的配置做一个计算
function mapState(obj){
  const ret = {}
  Object.keys(obj).forEach((key)=>{
    // 支持函数
    let val = obj[key]
    ret[key] = function(){
      const state = this.$store.state
      return typeof val === 'function'
        ? val.call(this, state)
        : state[val]
    }

  })
  return ret
}


function mapMutations(mutations){
  const ret = {}
  mutations.forEach((key)=>{
    ret[key] = function(){
      const commit = this.$store.commit
      commit(key)
    }

  })
  return ret
}

function install(_Vue) {
  Vue = _Vue
  _Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {Store, install};

export {mapState, mapMutations};
