<script setup>
</script>

<template>
    <Graphics
        :x="x"
        :y="y"

        @render="graphics=>{
            graphics.clear()
            graphics.beginFill({r: 118, g:33, b:204, a:255})
            graphics.drawRect(0, 0, width, width)
            graphics.endFill()
        }"
    >
    </Graphics>
</template>

<script>
    export default {
        name: 'SquareComponent',
        props: ['x', 'y', 'width']
    }
</script>