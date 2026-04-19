import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import App from "./App.vue";
import "./styles.css";
import "./dsn.css";
import "primeicons/primeicons.css";

const app = createApp(App);

app.use(PrimeVue, {
  ripple: true,
  unstyled: true,
});

app.component("PvButton", Button);
app.component("PvCard", Card);
app.component("PvCheckbox", Checkbox);
app.component("PvDivider", Divider);
app.component("PvInputText", InputText);

app.mount("#app");
