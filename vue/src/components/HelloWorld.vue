<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    {{ text }}
  </div>
</template>

<script>
import {myCustomTestFunction} from "@/utils";

export default {
  name: 'HelloWorld',
  data() {
    return {
      text: ''
    }
  },
  props: {
    msg: String
  },
  mounted() {
    this.text = myCustomTestFunction("Neuer Text")
  }
}
</script>
