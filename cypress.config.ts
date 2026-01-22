import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    // Base URL for PulseOps application
    baseUrl: 'http://localhost:5173',
    
    // Specify the pattern for feature files
    specPattern: 'cypress/e2e/features/**/*.feature',
    
    // Test timeout
    defaultCommandTimeout: 10000,
    
    // Viewport configuration
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video and screenshot configuration
    video: true,
    screenshotOnRunFailure: true,
    
    // Reporter configuration for Mochawesome
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
      charts: true,
      reportPageTitle: 'PulseOps E2E Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    
    async setupNodeEvents(on, config) {
      // Mochawesome reporter setup PRIMERO
      require('cypress-mochawesome-reporter/plugin')(on);
      
      // Cucumber preprocessor setup
      await addCucumberPreprocessorPlugin(on, config);
      
      // File preprocessor for .feature files
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );
      
      return config;
    },
  },
  
  // Environment variables
  env: {
    // Test tags for filtering
    TAGS: '',
  },
  
  // Retry configuration
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
