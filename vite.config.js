import {
  defineConfig
}
from "vite";

/* ====================================
   VITE CONFIG
==================================== */

export default defineConfig({

  server:{

    host:true,

    port:5173

  },

  build:{

    outDir:"dist",

    emptyOutDir:true

  }

});