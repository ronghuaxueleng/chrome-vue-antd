<script setup>
const closePopup = () => {
  window.close();
}
</script>
<template>
  <div class="popup-container">
    <button class="close-btn" @click="closePopup">×</button>
    <router-view />
  </div>
</template>
<style lang="stylus">
body
    position relative
    width: 520px
    height: 450px
    margin: 0
    padding: 0

#app
  height:100%
  position: relative

.popup-container
  position: relative
  height: 100%
  
.close-btn
  position: absolute
  top: 8px
  right: 8px
  z-index: 1000
  width: 24px
  height: 24px
  border: none
  background: rgba(0, 0, 0, 0.1)
  color: #666
  font-size: 18px
  line-height: 1
  cursor: pointer
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  transition: all 0.2s ease
  
  &:hover
    background: rgba(0, 0, 0, 0.2)
    color: #333
    
  &:active
    transform: scale(0.95)
</style>
