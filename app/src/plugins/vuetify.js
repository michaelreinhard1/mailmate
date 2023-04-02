import { createVuetify } from "vuetify";
import { VTooltip } from "vuetify/components/VTooltip";
import { Ripple } from "vuetify/directives";
import { VChip } from "vuetify/components/VChip";
import { VCombobox } from "vuetify/components/VCombobox";

const vuetify = createVuetify({
  components: {
    VTooltip,
    VChip,
    VCombobox,
  },
  directives: {
    Ripple,
  },
});

export default vuetify;
