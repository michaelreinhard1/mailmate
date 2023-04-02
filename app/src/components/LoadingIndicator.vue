<template>
  <div
    class="dot-elastic text-dark-800 bg-dark-800 dark:text-white dark:bg-white before:text-dark-800 after:text-dark-800 before:dark:text-white after:dark:text-white before:dark:bg-white after:dark:bg-white before:bg-dark-800 after:bg-dark-800"
  ></div>
</template>

<style scoped>
.loader,
.loader:before,
.loader:after {
  border-radius: 50%;
  width: 2.5em;
  height: 2.5em;
  animation-fill-mode: both;
  animation: bblFadInOut 1.8s infinite ease-in-out;
}
.loader {
  color: #fff;
  font-size: 7px;
  position: relative;
  text-indent: -9999em;
  transform: translateZ(0);
  animation-delay: -0.16s;
}
.loader:before,
.loader:after {
  content: "";
  position: absolute;
  top: 0;
}
.loader:before {
  left: -3.5em;
  animation-delay: -0.32s;
}
.loader:after {
  left: 3.5em;
}

@keyframes bblFadInOut {
  0%,
  80%,
  100% {
    box-shadow: 0 2.5em 0 -1.3em;
  }
  40% {
    box-shadow: 0 2.5em 0 0;
  }
}
</style>
