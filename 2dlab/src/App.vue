<template>
  <Application :width="640" :height="480">
    <TestComponent1 msg="Welcome to Your Vue.js App"/>
  </Application>
</template>

<script>
import { Application } from "vue3-pixi";
import TestComponent1 from './components/TestComponent1.vue'

export default {
  name: 'App',
  components: {
    TestComponent1,
    Application,
  }
}
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
