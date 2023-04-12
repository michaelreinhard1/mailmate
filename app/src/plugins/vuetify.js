import { createVuetify } from "vuetify";
import { VTooltip } from "vuetify/components/VTooltip";
import { Ripple } from "vuetify/directives";
import { VChip } from "vuetify/components/VChip";
import { VCombobox } from "vuetify/components/VCombobox";
import { VProgressLinear } from "vuetify/components/VProgressLinear";

const vuetify = createVuetify({
  components: {
    VTooltip,
    VChip,
    VCombobox,
    VProgressLinear,
  },
  directives: {
    Ripple,
  },
});

export default vuetify;
