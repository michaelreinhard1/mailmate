import { createVuetify } from "vuetify";
import { VTooltip } from "vuetify/components/VTooltip";
import { Ripple } from "vuetify/directives";
import { VProgressLinear } from "vuetify/components/VProgressLinear";

const vuetify = createVuetify({
  ssr: true,
  components: {
    VTooltip,
    VProgressLinear,
  },
  directives: {
    Ripple,
  },
});

export default vuetify;
