<template>
    <div class="context-menu" ref="popper" v-show="isVisible" tabindex="-1" v-click-outside="close" @contextmenu.capture.prevent>
        <ul class="dropdown-menu" role="menu">
            <slot :contextData="contextData" name="menu" />
        </ul>
    </div>
</template>
<script>
import Popper from "popper.js"

Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false
import ClickOutside from "vue-click-outside"

export default {
    name: "ContextMenu.vue",
    props: {
        boundariesElement: {
            type: String,
            default: "body",
        },
    },
    components: {},
    data() {
        return {
            opened: false,
            contextData: {},
        }
    },
    directives: {
        ClickOutside,
    },
    computed: {
        isVisible() {
            return this.opened
        },
    },
    methods: {
        open(evt, contextData) {
            this.opened = true
            this.contextData = contextData

            if (this.popper) {
                this.popper.destroy()
            }

            this.popper = new Popper(this.referenceObject(evt), this.$refs.popper, {
                placement: "right-start",
                modifiers: {
                    preventOverflow: {
                        boundariesElement: document.querySelector(this.boundariesElement),
                    },
                },
            })
            this.$nextTick(() => {
                this.popper.scheduleUpdate()
            })
        },
        close() {
            this.opened = false
            this.contextData = null
        },
        referenceObject(evt) {
            const left = evt.clientX
            const top = evt.clientY
            const right = left + 1
            const bottom = top + 1
            const clientWidth = 1
            const clientHeight = 1

            function getBoundingClientRect() {
                return {
                    left,
                    top,
                    right,
                    bottom,
                }
            }

            const obj = {
                getBoundingClientRect,
                clientWidth,
                clientHeight,
            }
            return obj
        },
    },
    beforeUnmount() {
        if (this.popper !== undefined) {
            this.popper.destroy()
        }
    },
}
</script>

<style scoped>
.context-menu {
    position: fixed;
    z-index: 5000;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px 0 #eee;
}

.context-menu:focus {
    outline: none;
}

.context-menu ul {
    padding: 0px;
    margin: 0px;
}

.dropdown-menu {
    display: block;
    position: relative;
}
</style>
