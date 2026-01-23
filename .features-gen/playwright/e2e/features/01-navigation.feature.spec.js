// Generated from: playwright/e2e/features/01-navigation.feature
import { test } from "playwright-bdd";

test.describe('Navegación base de PulseOps', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('el usuario visita la aplicación', null, { page }); 
  });
  
  test('La aplicación redirige a login cuando no está autenticado', async ({ When, Then, And, page }) => { 
    await When('el usuario accede a la raíz de la aplicación', null, { page }); 
    await Then('es redirigido automáticamente a "/login"', null, { page }); 
    await And('ve el formulario de inicio de sesión', null, { page }); 
  });

  test('Login exitoso y navegación al dashboard', async ({ Given, When, Then, And, page }) => { 
    await Given('el usuario está en la página de login', null, { page }); 
    await When('el usuario inicia sesión con credenciales válidas', null, { page }); 
    await Then('es redirigido automáticamente a "/dashboard"', null, { page }); 
    await And('ve el contenido del dashboard', null, { page }); 
  });

  test('Navegar a la sección de Recursos desde el dashboard', async ({ Given, When, Then, And, page }) => { 
    await Given('el usuario ha iniciado sesión exitosamente', null, { page }); 
    await And('está en la página "/dashboard"', null, { page }); 
    await When('el usuario hace click en el enlace "Resources" en el sidebar', null, { page }); 
    await Then('es redirigido a "/resources"', null, { page }); 
    await And('ve la lista de recursos', null, { page }); 
  });

  test('Navegar a la sección de Métricas desde el dashboard', async ({ Given, When, Then, And, page }) => { 
    await Given('el usuario ha iniciado sesión exitosamente', null, { page }); 
    await And('está en la página "/dashboard"', null, { page }); 
    await When('el usuario hace click en el enlace "Metrics" en el sidebar', null, { page }); 
    await Then('es redirigido a "/metrics"', null, { page }); 
    await And('ve la lista de métricas', null, { page }); 
  });

  test('Navegar a la sección de Registros desde el dashboard', async ({ Given, When, Then, And, page }) => { 
    await Given('el usuario ha iniciado sesión exitosamente', null, { page }); 
    await And('está en la página "/dashboard"', null, { page }); 
    await When('el usuario hace click en el enlace "Records" en el sidebar', null, { page }); 
    await Then('es redirigido a "/records"', null, { page }); 
    await And('ve la lista de registros', null, { page }); 
  });

  test('Cerrar sesión exitosamente', async ({ Given, When, Then, And, page }) => { 
    await Given('el usuario ha iniciado sesión exitosamente', null, { page }); 
    await And('está en la página "/dashboard"', null, { page }); 
    await When('el usuario cierra sesión', null, { page }); 
    await Then('es redirigido a "/login"', null, { page }); 
    await And('ve el formulario de inicio de sesión', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('playwright/e2e/features/01-navigation.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el usuario visita la aplicación","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When el usuario accede a la raíz de la aplicación","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then es redirigido automáticamente a \"/login\"","stepMatchArguments":[{"group":{"start":32,"value":"\"/login\"","children":[{"start":33,"value":"/login","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And ve el formulario de inicio de sesión","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el usuario visita la aplicación","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Context","textWithKeyword":"Given el usuario está en la página de login","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"When el usuario inicia sesión con credenciales válidas","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then es redirigido automáticamente a \"/dashboard\"","stepMatchArguments":[{"group":{"start":32,"value":"\"/dashboard\"","children":[{"start":33,"value":"/dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"And ve el contenido del dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el usuario visita la aplicación","isBg":true,"stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"Given el usuario ha iniciado sesión exitosamente","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":23,"keywordType":"Context","textWithKeyword":"And está en la página \"/dashboard\"","stepMatchArguments":[{"group":{"start":18,"value":"\"/dashboard\"","children":[{"start":19,"value":"/dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When el usuario hace click en el enlace \"Resources\" en el sidebar","stepMatchArguments":[{"group":{"start":35,"value":"\"Resources\"","children":[{"start":36,"value":"Resources","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then es redirigido a \"/resources\"","stepMatchArguments":[{"group":{"start":16,"value":"\"/resources\"","children":[{"start":17,"value":"/resources","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"And ve la lista de recursos","stepMatchArguments":[]}]},
  {"pwTestLine":31,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el usuario visita la aplicación","isBg":true,"stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":29,"keywordType":"Context","textWithKeyword":"Given el usuario ha iniciado sesión exitosamente","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":30,"keywordType":"Context","textWithKeyword":"And está en la página \"/dashboard\"","stepMatchArguments":[{"group":{"start":18,"value":"\"/dashboard\"","children":[{"start":19,"value":"/dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"When el usuario hace click en el enlace \"Metrics\" en el sidebar","stepMatchArguments":[{"group":{"start":35,"value":"\"Metrics\"","children":[{"start":36,"value":"Metrics","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":35,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then es redirigido a \"/metrics\"","stepMatchArguments":[{"group":{"start":16,"value":"\"/metrics\"","children":[{"start":17,"value":"/metrics","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":36,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And ve la lista de métricas","stepMatchArguments":[]}]},
  {"pwTestLine":39,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el usuario visita la aplicación","isBg":true,"stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":36,"keywordType":"Context","textWithKeyword":"Given el usuario ha iniciado sesión exitosamente","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":37,"keywordType":"Context","textWithKeyword":"And está en la página \"/dashboard\"","stepMatchArguments":[{"group":{"start":18,"value":"\"/dashboard\"","children":[{"start":19,"value":"/dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"When el usuario hace click en el enlace \"Records\" en el sidebar","stepMatchArguments":[{"group":{"start":35,"value":"\"Records\"","children":[{"start":36,"value":"Records","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":43,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"Then es redirigido a \"/records\"","stepMatchArguments":[{"group":{"start":16,"value":"\"/records\"","children":[{"start":17,"value":"/records","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":44,"gherkinStepLine":40,"keywordType":"Outcome","textWithKeyword":"And ve la lista de registros","stepMatchArguments":[]}]},
  {"pwTestLine":47,"pickleLine":42,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given el usuario visita la aplicación","isBg":true,"stepMatchArguments":[]},{"pwStepLine":48,"gherkinStepLine":43,"keywordType":"Context","textWithKeyword":"Given el usuario ha iniciado sesión exitosamente","stepMatchArguments":[]},{"pwStepLine":49,"gherkinStepLine":44,"keywordType":"Context","textWithKeyword":"And está en la página \"/dashboard\"","stepMatchArguments":[{"group":{"start":18,"value":"\"/dashboard\"","children":[{"start":19,"value":"/dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":50,"gherkinStepLine":45,"keywordType":"Action","textWithKeyword":"When el usuario cierra sesión","stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"Then es redirigido a \"/login\"","stepMatchArguments":[{"group":{"start":16,"value":"\"/login\"","children":[{"start":17,"value":"/login","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":52,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"And ve el formulario de inicio de sesión","stepMatchArguments":[]}]},
]; // bdd-data-end