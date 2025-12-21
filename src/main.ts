import './assets/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'bootstrap'; 

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vSelect from 'vue-select';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const app = createApp(App).component('v-select', vSelect);

app.use(router);
app.use(Toast, {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 3,
  newestOnTop: true
});

app.mount('#app');
