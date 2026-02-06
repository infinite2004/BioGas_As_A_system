import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/BioGas_As_A_system/',   // <-- repo name, exact casing
  plugins: [react()],
})